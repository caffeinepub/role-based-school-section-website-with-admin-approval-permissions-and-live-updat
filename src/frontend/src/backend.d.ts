import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface ClassRoutine {
    id: bigint;
    routines: Array<RoutineDay>;
    author: Principal;
    timestamp: Time;
}
export interface ProfileResponse {
    username: string;
    name: string;
    role: Role;
}
export interface RoutineDay {
    periods: Array<RoutinePeriod>;
    dayName: string;
}
export interface StudentApplication {
    username: string;
    password: string;
    name: string;
    section: string;
    className: string;
}
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export type StudentLoginStatus = {
    __kind__: "pending";
    pending: null;
} | {
    __kind__: "approved";
    approved: {
        principal: Principal;
        name: string;
        role: Role;
    };
} | {
    __kind__: "rejected";
    rejected: null;
} | {
    __kind__: "invalidCredentials";
    invalidCredentials: null;
};
export interface RoutinePeriod {
    startTime: string;
    subject: string;
    endTime: string;
    teacher: string;
    periodNumber: bigint;
}
export interface Announcement {
    id: bigint;
    title: string;
    content: string;
    author: Principal;
    timestamp: Time;
}
export interface ClassTime {
    id: bigint;
    startTime: string;
    weekDay: string;
    subject: string;
    endTime: string;
    teacher: string;
    author: Principal;
}
export interface Homework {
    id: bigint;
    title: string;
    content: string;
    subject: string;
    teacher: string;
    dueDate: string;
    author: Principal;
    timestamp: Time;
}
export interface UserProfile {
    username: string;
    name: string;
    role: Role;
}
export interface Student {
    principal: Principal;
    profile: ProfileResponse;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum Role {
    admin = "admin",
    studentEditor = "studentEditor",
    student = "student"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAnnouncement(title: string, content: string): Promise<void>;
    addClassRoutine(routine: Array<RoutineDay>): Promise<void>;
    addClassTime(weekDay: string, startTime: string, endTime: string, subject: string, teacher: string): Promise<void>;
    addHomework(title: string, content: string, dueDate: string, subject: string, teacher: string): Promise<void>;
    approveStudentApplication(username: string, studentPrincipal: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteAnnouncement(id: bigint): Promise<void>;
    deleteClassRoutine(id: bigint): Promise<void>;
    deleteClassTime(id: bigint): Promise<void>;
    deleteHomework(id: bigint): Promise<void>;
    demoteToStudent(username: string): Promise<void>;
    getAllAnnouncements(): Promise<Array<Announcement>>;
    getAllApplications(): Promise<Array<StudentApplication>>;
    getAllClassTimes(): Promise<Array<ClassTime>>;
    getAllHomeworks(): Promise<Array<Homework>>;
    getAllRoutines(): Promise<Array<ClassRoutine>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getStudentsList(): Promise<Array<Student>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    isContentLocked(section: string, itemId: bigint | null): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    promoteToEditor(username: string): Promise<void>;
    rejectStudentApplication(username: string): Promise<void>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    setItemLock(section: string, itemId: bigint, state: boolean): Promise<void>;
    setMasterLock(state: boolean): Promise<void>;
    setSectionLock(section: string, state: boolean): Promise<void>;
    submitApplication(app: StudentApplication): Promise<void>;
    tryStudentLogin(username: string, password: string): Promise<StudentLoginStatus>;
    updateAnnouncement(id: bigint, title: string, content: string): Promise<void>;
    updateClassRoutine(id: bigint, routine: Array<RoutineDay>): Promise<void>;
    updateClassTime(id: bigint, weekDay: string, startTime: string, endTime: string, subject: string, teacher: string): Promise<void>;
    updateHomework(id: bigint, title: string, content: string, dueDate: string, subject: string, teacher: string): Promise<void>;
}
