export type IssueType = "bug" | "feature" | "improvement";
export type Priority = "low" | "medium" | "high";
export type Status = "open" | "in-progress" | "resolved";

export interface Issue {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  priority: Priority;
  status: Status;
  createdAt: string;
}
