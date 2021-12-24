export enum ChatColor {
  Black = 'black', // 0
  DarkBlue = 'dark_blue', // 1
  DarkGreen = 'dark_green', // 2
  DarkCyan = 'dark_aqua', // 3
  DarkRed = 'dark_red', // 4
  DarkGray = 'dark_gray', // 8
  Purple = 'dark_purple', // 5
  Gold = 'gold', // 6
  Gray = 'gray', // 7
  Blue = 'blue', // 9
  Green = 'green', // a
  Cyan = 'aqua', // b
  Red = 'red', // c
  Pink = 'light_purple', // d
  Yellow = 'yellow', // e
  White = 'white', // f
}

export interface IChat {
  text: string;
  bold?: boolean; // l
  italic?: boolean; // o
  underlined?: boolean; // n
  strikethrough?: boolean; // m
  obfuscated?: boolean; // k
  color?: ChatColor;
  extra?: IChat[];
}

export interface IRawPingResponse {
  players: {
    online: number;
    max: number;
    sample?: {
      id: string;
      name: string;
    }[];
  };
  version?: {
    name: string;
    protocol: number;
  };
  favicon?: string;
  description: string | IChat;
}

export interface IPingResponse extends IRawPingResponse {
  host: string;
  port: number;
  ip?: string;
}
