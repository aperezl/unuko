export interface Subscriber {
  imsi: string;
  subscribedSnssaiList?: Array<{
    sst: number;
    sd: string;
  }>;
  sliceConfigs?: Array<{
    sst: number;
    sd: string;
    default?: boolean;
  }>;
  [key: string]: any;
}
