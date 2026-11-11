export interface IBtsLoginResponse {

    status: boolean;
    message: string;
    data: {
        access_token: string;
        refresh_token: string;
    };
}

export interface IBtsRefreshResponse {
    status: boolean;
    message: string;
    data: {
        access_token: string;
        refresh_token: string;
    };
}

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
};

export interface IGetStateResponse {
    status: boolean;
    message: string;
    status_code: number;
    data: {
        orderId: number;
        status: {
            code: number;
            name: string;
        };
    };
}

export interface ICalculateDeliveryCostRequest {
    senderCityCode: string;
    receiverCityCode: string;
    pickup_type: "self";
    dropoff_type: "branch";
    is_multiple_cost: 1 | 0;
    weight: number;
    volume: {
        x: number;
        y: number;
        z: number;
    };
}

export interface IBtsCreateOrderRequest {
    order_id: string;
    sender_factory_id: string;
    // pickup_type = "self",
    // dropoff_type = "self",
    // is_sender_location = true,
    // is_receiver_location = true,
    sender: {
        name: string;
        phone: string;
        address: string;
        city_code: string;
        brand_code: string;
    },
    receiver: {
        name: string;
        phone: string;
        address: string;
        city_code: string;
        brand_code: string;
        latitude: number;
        longitude: number;
    },
    takePhoto: number,
    back_money: number,
    weight: number,
    volume: {
        x: number;
        y: number;
        z: number;
    },
    piece: number,
    packageId: string,
    postTypeId: string,
    postTypes: IBtsPostTypes[],
    options: IBtsCreateOrderOptions[];
}

export interface IBtsPostTypes {
    code: string,
    count: number,
    cost: number
}

export interface IBtsGoods {
    mxikGoodsId: number;
    amount: number;
    goodPrice: number;
}

export interface IBtsCreateOrderOptions {
    optionId: number;
    goods: IBtsGoods[];
}

export interface IGetBranchesRequest {
    region_code: string;
    city_code: string;
};

export interface ICreateOrderRequest {
    clientId: string;
    pickup_type: "self";
    dropoff_type: "branch";
    is_sender_location: boolean;
    is_receiver_location: boolean;
    sender: {
        name: string;
        phone: string;
        address: string;
        city_code: string;
    };
    receiver: {
        name: string;
        phone: string;
        phone1?: string;
        address: string;
        city_code: string;
        branch_code: string;
    };
    back_money: number;
    takePhoto: number;
    cargo: {
        weight: number;
        volume: number;
        piece: number;
        packageId: number;
        postTypeId: number;
        postTypes: {
            name: string;
            code: string;
            count: number;
            cost: number;
        }[];
        options: {
            optionId: number;
            goods: {
                mxikGoodsId: number;
                amount: number;
                goodPrice: number;
            }[];
        }[];
    };
    ready_to_take: boolean;
};