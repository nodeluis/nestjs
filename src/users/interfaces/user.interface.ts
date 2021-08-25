export interface User{
    id?:number;
    user:string;
    password:string;
}

export interface DataStoredInToken {
    id: number;
}
  
export interface TokenData {
    token: string;
    expiresIn: number;
}
