import AccessControl "authorization/access-control";
import UserApproval "user-approval/approval";
import MixinAuthorization "authorization/MixinAuthorization";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Nat "mo:core/Nat";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Initialize the approval state
  let approvalState = UserApproval.initState(accessControlState);

  // Custom role system for application-specific roles
  type Role = {
    #student;
    #studentEditor;
    #admin;
  };

  public type LockState = {
    master : Bool;
    sections : {
      notices : Bool;
      homework : Bool;
      routine : Bool;
      classTime : Bool;
    };
    itemLocks : {
      notices : Map.Map<Nat, Bool>;
      homework : Map.Map<Nat, Bool>;
      routine : Map.Map<Nat, Bool>;
      classTime : Map.Map<Nat, Bool>;
    };
  };

  public type UserProfile = {
    name : Text;
    username : Text;
    role : Role;
  };

  public type StudentApplication = {
    name : Text;
    className : Text;
    section : Text;
    username : Text;
    password : Text;
  };

  public type Announcement = {
    id : Nat;
    title : Text;
    content : Text;
    timestamp : Time.Time;
    author : Principal;
  };

  public type Homework = {
    id : Nat;
    title : Text;
    content : Text;
    dueDate : Text;
    subject : Text;
    teacher : Text;
    timestamp : Time.Time;
    author : Principal;
  };

  public type RoutinePeriod = {
    periodNumber : Nat;
    subject : Text;
    teacher : Text;
    startTime : Text;
    endTime : Text;
  };

  public type RoutineDay = {
    dayName : Text;
    periods : [RoutinePeriod];
  };

  public type ClassRoutine = {
    id : Nat;
    routines : [RoutineDay];
    timestamp : Time.Time;
    author : Principal;
  };

  public type ClassTime = {
    id : Nat;
    weekDay : Text;
    startTime : Text;
    endTime : Text;
    subject : Text;
    teacher : Text;
    author : Principal;
  };

  public type StudentLoginStatus = {
    #approved : {
      principal : Principal;
      role : Role;
      name : Text;
    };
    #pending;
    #rejected;
    #invalidCredentials;
  };

  public type ProfileResponse = {
    username : Text;
    role : Role;
    name : Text;
  };

  public type Student = {
    principal : Principal;
    profile : ProfileResponse;
  };

  // Data stores
  let studentApplications = Map.empty<Text, StudentApplication>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let usernameToProfile = Map.empty<Text, Principal>();
  let pendingApprovals = Map.empty<Principal, Text>(); // Maps principal to username for approval flow
  let studentCredentials = Map.empty<Text, Text>(); // Maps username to password for approved students
  let announcements = Map.empty<Nat, Announcement>();
  let homeworks = Map.empty<Nat, Homework>();
  let classRoutines = Map.empty<Nat, ClassRoutine>();
  let classTimes = Map.empty<Nat, ClassTime>();

  var nextAnnouncementId : Nat = 0;
  var nextHomeworkId : Nat = 0;
  var nextRoutineId : Nat = 0;
  var nextClassTimeId : Nat = 0;
  var lockState : LockState = {
    master = false;
    sections = {
      notices = false;
      homework = false;
      routine = false;
      classTime = false;
    };
    itemLocks = {
      notices = Map.empty<Nat, Bool>();
      homework = Map.empty<Nat, Bool>();
      routine = Map.empty<Nat, Bool>();
      classTime = Map.empty<Nat, Bool>();
    };
  };

  // Authorization helper functions
  func requireAdmin(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  func isEditor(caller : Principal) : Bool {
    let profile = userProfiles.get(caller);
    switch (profile) {
      case (?p) { 
        switch (p.role) {
          case (#studentEditor) { true };
          case (#admin) { true };
          case (_) { false };
        };
      };
      case (null) { AccessControl.isAdmin(accessControlState, caller) };
    };
  };

  func requireEditor(caller : Principal) {
    if (not isEditor(caller)) {
      Runtime.trap("Unauthorized: Only admins and editors can perform this action");
    };
  };

  func requireApproval(caller : Principal) {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only approved users can perform this action");
    };
  };

  // Lock checking functions - these enforce the lock hierarchy
  func checkMasterLock() {
    if (lockState.master) {
      Runtime.trap("All editing is currently locked by master lock");
    };
  };

  func checkSectionLock(section : Text) {
    let sectionLocked = switch (section) {
      case ("notices") { lockState.sections.notices };
      case ("homework") { lockState.sections.homework };
      case ("routine") { lockState.sections.routine };
      case ("classTime") { lockState.sections.classTime };
      case (_) { Runtime.trap("Invalid section") };
    };
    
    if (sectionLocked) {
      Runtime.trap("This section is currently locked for editing");
    };
  };

  func checkItemLock(section : Text, itemId : Nat) {
    let itemLocked = switch (section) {
      case ("notices") { lockState.itemLocks.notices.get(itemId) == ?true };
      case ("homework") { lockState.itemLocks.homework.get(itemId) == ?true };
      case ("routine") { lockState.itemLocks.routine.get(itemId) == ?true };
      case ("classTime") { lockState.itemLocks.classTime.get(itemId) == ?true };
      case (_) { Runtime.trap("Invalid section") };
    };
    
    if (itemLocked) {
      Runtime.trap("This item is currently locked for editing");
    };
  };

  // Combined lock enforcement: checks master -> section -> item (if provided)
  func enforceLockPolicy(section : Text, itemId : ?Nat) {
    checkMasterLock();
    checkSectionLock(section);
    switch (itemId) {
      case (?id) { checkItemLock(section, id) };
      case (null) { };
    };
  };

  public query ({ caller }) func isContentLocked(section : Text, itemId : ?Nat) : async Bool {
    // Anyone can check lock status (including guests)
    // Master lock check
    if (lockState.master) { return true; };

    // Section lock check
    let sectionLocked = switch (section) {
      case ("notices") { lockState.sections.notices };
      case ("homework") { lockState.sections.homework };
      case ("routine") { lockState.sections.routine };
      case ("classTime") { lockState.sections.classTime };
      case (_) { Runtime.trap("Invalid section") };
    };

    if (sectionLocked) { return true };

    // Item lock check
    switch (itemId) {
      case (null) { false };
      case (?id) {
        switch (section) {
          case ("notices") { lockState.itemLocks.notices.get(id) == ?true };
          case ("homework") { lockState.itemLocks.homework.get(id) == ?true };
          case ("routine") { lockState.itemLocks.routine.get(id) == ?true };
          case ("classTime") { lockState.itemLocks.classTime.get(id) == ?true };
          case (_) { Runtime.trap("Invalid section") };
        };
      };
    };
  };

  // Lock Management Functions - Admin only
  public shared ({ caller }) func setMasterLock(state : Bool) : async () {
    requireAdmin(caller);
    lockState := {
      master = state;
      sections = lockState.sections;
      itemLocks = lockState.itemLocks;
    };
  };

  public shared ({ caller }) func setSectionLock(section : Text, state : Bool) : async () {
    requireAdmin(caller);

    lockState := {
      master = lockState.master;
      sections = switch (section) {
        case ("notices") {
          {
            notices = state;
            homework = lockState.sections.homework;
            routine = lockState.sections.routine;
            classTime = lockState.sections.classTime;
          };
        };
        case ("homework") {
          {
            notices = lockState.sections.notices;
            homework = state;
            routine = lockState.sections.routine;
            classTime = lockState.sections.classTime;
          };
        };
        case ("routine") {
          {
            notices = lockState.sections.notices;
            homework = lockState.sections.homework;
            routine = state;
            classTime = lockState.sections.classTime;
          };
        };
        case ("classTime") {
          {
            notices = lockState.sections.notices;
            homework = lockState.sections.homework;
            routine = lockState.sections.routine;
            classTime = state;
          };
        };
        case (_) { Runtime.trap("Invalid section") };
      };
      itemLocks = lockState.itemLocks;
    };
  };

  public shared ({ caller }) func setItemLock(section : Text, itemId : Nat, state : Bool) : async () {
    requireAdmin(caller);
    
    // Verify item exists before locking
    let itemExists = switch (section) {
      case ("notices") { announcements.containsKey(itemId) };
      case ("homework") { homeworks.containsKey(itemId) };
      case ("routine") { classRoutines.containsKey(itemId) };
      case ("classTime") { classTimes.containsKey(itemId) };
      case (_) { Runtime.trap("Invalid section") };
    };
    
    if (not itemExists) {
      Runtime.trap("Item does not exist");
    };
    
    switch (section) {
      case ("notices") {
        lockState := {
          master = lockState.master;
          sections = lockState.sections;
          itemLocks = {
            notices = addItemLock(lockState.itemLocks.notices, itemId, state);
            homework = lockState.itemLocks.homework;
            routine = lockState.itemLocks.routine;
            classTime = lockState.itemLocks.classTime;
          };
        };
      };
      case ("homework") {
        lockState := {
          master = lockState.master;
          sections = lockState.sections;
          itemLocks = {
            notices = lockState.itemLocks.notices;
            homework = addItemLock(lockState.itemLocks.homework, itemId, state);
            routine = lockState.itemLocks.routine;
            classTime = lockState.itemLocks.classTime;
          };
        };
      };
      case ("routine") {
        lockState := {
          master = lockState.master;
          sections = lockState.sections;
          itemLocks = {
            notices = lockState.itemLocks.notices;
            homework = lockState.itemLocks.homework;
            routine = addItemLock(lockState.itemLocks.routine, itemId, state);
            classTime = lockState.itemLocks.classTime;
          };
        };
      };
      case ("classTime") {
        lockState := {
          master = lockState.master;
          sections = lockState.sections;
          itemLocks = {
            notices = lockState.itemLocks.notices;
            homework = lockState.itemLocks.homework;
            routine = lockState.itemLocks.routine;
            classTime = addItemLock(lockState.itemLocks.classTime, itemId, state);
          };
        };
      };
      case (_) { Runtime.trap("Invalid section") };
    };
  };

  func addItemLock(map : Map.Map<Nat, Bool>, itemId : Nat, state : Bool) : Map.Map<Nat, Bool> {
    let newMap = map.clone();
    if (state) {
      newMap.add(itemId, true);
    } else {
      newMap.remove(itemId);
    };
    newMap;
  };

  // User Profile Functions (required by instructions)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Student Application Functions
  public shared func submitApplication(app : StudentApplication) : async () {
    // Anyone (including guests) can submit application - no caller needed
    if (usernameToProfile.containsKey(app.username)) {
      Runtime.trap("Username already taken");
    };
    if (studentApplications.containsKey(app.username)) {
      Runtime.trap("Application already submitted for this username");
    };
    studentApplications.add(app.username, app);
  };

  public query ({ caller }) func getAllApplications() : async [StudentApplication] {
    requireAdmin(caller);
    Array.fromIter(studentApplications.values());
  };

  public shared ({ caller }) func approveStudentApplication(username : Text, studentPrincipal : Principal) : async () {
    requireAdmin(caller);
    
    switch (studentApplications.get(username)) {
      case (null) { Runtime.trap("Application not found") };
      case (?app) {
        if (usernameToProfile.containsKey(username)) {
          Runtime.trap("Username already taken");
        };
        
        // Assign user role in access control system
        AccessControl.assignRole(accessControlState, caller, studentPrincipal, #user);
        
        let profile : UserProfile = {
          name = app.name;
          username = app.username;
          role = #student;
        };
        
        userProfiles.add(studentPrincipal, profile);
        usernameToProfile.add(username, studentPrincipal);
        studentCredentials.add(username, app.password);
        studentApplications.remove(username);
        pendingApprovals.remove(studentPrincipal);
      };
    };
  };

  public shared ({ caller }) func rejectStudentApplication(username : Text) : async () {
    requireAdmin(caller);
    
    // Remove from pending approvals
    var principalToRemove : ?Principal = null;
    for ((principal, uname) in pendingApprovals.entries()) {
      if (uname == username) {
        principalToRemove := ?principal;
      };
    };
    
    switch (principalToRemove) {
      case (?p) { pendingApprovals.remove(p) };
      case (null) { };
    };
    
    studentApplications.remove(username);
  };

  public shared ({ caller }) func promoteToEditor(username : Text) : async () {
    requireAdmin(caller);
    
    switch (usernameToProfile.get(username)) {
      case (null) { Runtime.trap("User not found") };
      case (?userPrincipal) {
        // Verify user has at least user permission in access control
        if (not AccessControl.hasPermission(accessControlState, userPrincipal, #user)) {
          Runtime.trap("User is not approved in the system");
        };
        
        switch (userProfiles.get(userPrincipal)) {
          case (null) { Runtime.trap("User profile not found") };
          case (?profile) {
            switch (profile.role) {
              case (#student) {
                let updatedProfile : UserProfile = {
                  name = profile.name;
                  username = profile.username;
                  role = #studentEditor;
                };
                userProfiles.add(userPrincipal, updatedProfile);
              };
              case (#studentEditor) { Runtime.trap("User is already an editor") };
              case (#admin) { Runtime.trap("Cannot modify admin role") };
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func demoteToStudent(username : Text) : async () {
    requireAdmin(caller);
    
    switch (usernameToProfile.get(username)) {
      case (null) { Runtime.trap("User not found") };
      case (?userPrincipal) {
        // Verify user has at least user permission in access control
        if (not AccessControl.hasPermission(accessControlState, userPrincipal, #user)) {
          Runtime.trap("User is not approved in the system");
        };
        
        switch (userProfiles.get(userPrincipal)) {
          case (null) { Runtime.trap("User profile not found") };
          case (?profile) {
            switch (profile.role) {
              case (#studentEditor) {
                let updatedProfile : UserProfile = {
                  name = profile.name;
                  username = profile.username;
                  role = #student;
                };
                userProfiles.add(userPrincipal, updatedProfile);
              };
              case (#student) { Runtime.trap("User is already a student") };
              case (#admin) { Runtime.trap("Cannot modify admin role") };
            };
          };
        };
      };
    };
  };

  // Announcement & Notice Functions
  public shared ({ caller }) func addAnnouncement(title : Text, content : Text) : async () {
    // Lock enforcement BEFORE permission check - locks take precedence
    enforceLockPolicy("notices", null);
    // Then check editor permission
    requireEditor(caller);

    let announcement : Announcement = {
      id = nextAnnouncementId;
      title;
      content;
      timestamp = Time.now();
      author = caller;
    };

    announcements.add(announcement.id, announcement);
    nextAnnouncementId += 1;
  };

  public query func getAllAnnouncements() : async [Announcement] {
    // Anyone can view announcements (including guests)
    Array.fromIter(announcements.values());
  };

  public shared ({ caller }) func updateAnnouncement(id : Nat, title : Text, content : Text) : async () {
    // Lock enforcement BEFORE permission check
    enforceLockPolicy("notices", ?id);
    // Then check editor permission
    requireEditor(caller);
    
    switch (announcements.get(id)) {
      case (null) { Runtime.trap("Announcement not found") };
      case (?existing) {
        let updated : Announcement = {
          id = existing.id;
          title;
          content;
          timestamp = Time.now();
          author = caller;
        };
        announcements.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteAnnouncement(id : Nat) : async () {
    // Lock enforcement BEFORE permission check
    enforceLockPolicy("notices", ?id);
    // Then check editor permission
    requireEditor(caller);
    
    if (not announcements.containsKey(id)) {
      Runtime.trap("Announcement not found");
    };
    
    announcements.remove(id);
    // Clean up item lock if it exists
    lockState.itemLocks.notices.remove(id);
  };

  // Homework Functions
  public shared ({ caller }) func addHomework(title : Text, content : Text, dueDate : Text, subject : Text, teacher : Text) : async () {
    // Lock enforcement BEFORE permission check
    enforceLockPolicy("homework", null);
    // Then check editor permission
    requireEditor(caller);

    let homework : Homework = {
      id = nextHomeworkId;
      title;
      content;
      dueDate;
      subject;
      teacher;
      timestamp = Time.now();
      author = caller;
    };

    homeworks.add(homework.id, homework);
    nextHomeworkId += 1;
  };

  public query func getAllHomeworks() : async [Homework] {
    // Anyone can view homework (including guests)
    Array.fromIter(homeworks.values());
  };

  public shared ({ caller }) func updateHomework(id : Nat, title : Text, content : Text, dueDate : Text, subject : Text, teacher : Text) : async () {
    // Lock enforcement BEFORE permission check
    enforceLockPolicy("homework", ?id);
    // Then check editor permission
    requireEditor(caller);
    
    switch (homeworks.get(id)) {
      case (null) { Runtime.trap("Homework not found") };
      case (?existing) {
        let updated : Homework = {
          id = existing.id;
          title;
          content;
          dueDate;
          subject;
          teacher;
          timestamp = Time.now();
          author = caller;
        };
        homeworks.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteHomework(id : Nat) : async () {
    // Lock enforcement BEFORE permission check
    enforceLockPolicy("homework", ?id);
    // Then check editor permission
    requireEditor(caller);
    
    if (not homeworks.containsKey(id)) {
      Runtime.trap("Homework not found");
    };
    
    homeworks.remove(id);
    // Clean up item lock if it exists
    lockState.itemLocks.homework.remove(id);
  };

  // Class Routine Functions
  public query func getAllRoutines() : async [ClassRoutine] {
    // Anyone can view routines (including guests)
    Array.fromIter(classRoutines.values());
  };

  public shared ({ caller }) func addClassRoutine(routine : [RoutineDay]) : async () {
    // Lock enforcement BEFORE permission check
    enforceLockPolicy("routine", null);
    // Then check editor permission
    requireEditor(caller);

    let classRoutine : ClassRoutine = {
      id = nextRoutineId;
      routines = routine;
      timestamp = Time.now();
      author = caller;
    };

    classRoutines.add(classRoutine.id, classRoutine);
    nextRoutineId += 1;
  };

  public shared ({ caller }) func updateClassRoutine(id : Nat, routine : [RoutineDay]) : async () {
    // Lock enforcement BEFORE permission check
    enforceLockPolicy("routine", ?id);
    // Then check editor permission
    requireEditor(caller);
    
    switch (classRoutines.get(id)) {
      case (null) { Runtime.trap("Class routine not found") };
      case (?existing) {
        let updated : ClassRoutine = {
          id = existing.id;
          routines = routine;
          timestamp = Time.now();
          author = caller;
        };
        classRoutines.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteClassRoutine(id : Nat) : async () {
    // Lock enforcement BEFORE permission check
    enforceLockPolicy("routine", ?id);
    // Then check editor permission
    requireEditor(caller);
    
    if (not classRoutines.containsKey(id)) {
      Runtime.trap("Class routine not found");
    };
    
    classRoutines.remove(id);
    // Clean up item lock if it exists
    lockState.itemLocks.routine.remove(id);
  };

  // Class Time Functions
  public shared ({ caller }) func addClassTime(weekDay : Text, startTime : Text, endTime : Text, subject : Text, teacher : Text) : async () {
    // Lock enforcement BEFORE permission check
    enforceLockPolicy("classTime", null);
    // Then check editor permission
    requireEditor(caller);

    let classTime : ClassTime = {
      id = nextClassTimeId;
      weekDay;
      startTime;
      endTime;
      subject;
      teacher;
      author = caller;
    };

    classTimes.add(classTime.id, classTime);
    nextClassTimeId += 1;
  };

  public query func getAllClassTimes() : async [ClassTime] {
    // Anyone can view class times (including guests)
    Array.fromIter(classTimes.values());
  };

  public shared ({ caller }) func updateClassTime(id : Nat, weekDay : Text, startTime : Text, endTime : Text, subject : Text, teacher : Text) : async () {
    // Lock enforcement BEFORE permission check
    enforceLockPolicy("classTime", ?id);
    // Then check editor permission
    requireEditor(caller);
    
    switch (classTimes.get(id)) {
      case (null) { Runtime.trap("Class time not found") };
      case (?existing) {
        let updated : ClassTime = {
          id;
          weekDay;
          startTime;
          endTime;
          subject;
          teacher;
          author = caller;
        };
        classTimes.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteClassTime(id : Nat) : async () {
    // Lock enforcement BEFORE permission check
    enforceLockPolicy("classTime", ?id);
    // Then check editor permission
    requireEditor(caller);
    
    if (not classTimes.containsKey(id)) {
      Runtime.trap("Class time not found");
    };
    
    classTimes.remove(id);
    // Clean up item lock if it exists
    lockState.itemLocks.classTime.remove(id);
  };

  // Approval Check Functions
  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    requireAdmin(caller);
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    requireAdmin(caller);
    UserApproval.listApprovals(approvalState);
  };

  // Student login and role check function - UNAUTHENTICATED (allows guests to check status)
  public query func tryStudentLogin(username : Text, password : Text) : async StudentLoginStatus {
    // Check if username exists and is approved
    switch (usernameToProfile.get(username)) {
      case (null) {
        // Check if there's a pending application with this username
        switch (studentApplications.get(username)) {
          case (?app) {
            if (app.password == password) {
              return #pending;
            } else {
              return #invalidCredentials;
            };
          };
          case (null) { return #invalidCredentials };
        };
      };
      case (?ownerPrincipal) {
        // Check if user is approved in access control
        if (not AccessControl.hasPermission(accessControlState, ownerPrincipal, #user)) {
          return #rejected;
        };

        // Validate password
        switch (studentCredentials.get(username)) {
          case (null) { #invalidCredentials };
          case (?storedPassword) {
            if (password != storedPassword) {
              return #invalidCredentials;
            };

            // Get profile and return approved status
            switch (userProfiles.get(ownerPrincipal)) {
              case (null) { #invalidCredentials };
              case (?profile) {
                #approved({
                  principal = ownerPrincipal;
                  role = profile.role;
                  name = profile.name;
                });
              };
            };
          };
        };
      };
    };
  };

  // Students list for admin
  public query ({ caller }) func getStudentsList() : async [Student] {
    requireAdmin(caller);

    let profiles = userProfiles.toArray();
    let studentsList = List.empty<Student>();

    for ((principal, profile) in profiles.values()) {
      studentsList.add({
        principal;
        profile = {
          username = profile.username;
          role = profile.role;
          name = profile.name;
        };
      });
    };
    studentsList.toArray();
  };
};
