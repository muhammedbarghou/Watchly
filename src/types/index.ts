export interface Message {
  id: number;
  user: string;
  text: string;
  avatar: string;
}

export interface Member {
  avatar: string;
  name: string;
  status: string;
}