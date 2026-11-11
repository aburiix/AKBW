export interface IBtsRegion {
  code: string;
  name: string;
}

export interface IBtsCity {
  code: string;
  name: string;
}

export interface IBtsResponse<T> {
  status: boolean;
  message: string;
  status_code: number;
  data: {
    items: T[];
    _links?: {
      self: string;
      first: string;
      last: string;
      next: string | null;
      prev: string | null;
    };
    _meta?: {
      totalCount: number;
      pageCount: number;
      currentPage: number;
      perPage: number;
      params: any[];
    };
  };
}
export interface IGetBranchesRequest {
  regionCode: string;
  cityCode: string;
}

export interface IBtsBranch {
  code: string;
  name: string;
  regionCode: string;
  cityCode: string;
  address: string;
  lat_long: string;
  phone: string;
  video_link: string;
  working_hours: {
    [key: number]: string | null;
  };
}
