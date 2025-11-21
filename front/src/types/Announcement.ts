export interface Attachment {
  url: string;
  width: number;
  height: number;
}

export interface Announcement {
  content: string;
  timestamp: string;
  attachments: Attachment[];
  author: {
    username: string;
  };
}
