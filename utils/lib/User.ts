export interface IUser {
  id: string;
  name: string;
  email: string;
  auth: {
    token: string;
  };
}
