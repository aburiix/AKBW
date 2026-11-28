import type {
    IBtsLoginResponse,
    IBtsRefreshResponse,
    IBtsRegion,
    IBtsCity,
    IBtsResponse,
    IGetStateResponse,
    ICalculateDeliveryCostRequest,
    IGetBranchesRequest,
    ICreateOrderRequest
} from "../types/delivery.types.js";
import dotenv from "dotenv";
import axios, {
    isAxiosError
} from "axios";
import { safeErr } from "../utils/safeErr.util.js";


dotenv.config();



class DeliveryService {
    private baseUrl: string = String(process.env.BTS_BASE_URL || "https://apitest.bts.uz:28345");
    private passwordUser: string = String(process.env.BTS_PASSWORD);
    private loginUser: string = String(process.env.BTS_LOGIN);
    private refreshTokenValue: string | null = null;
    private accessToken: string | null = null;

    async login(): Promise<IBtsLoginResponse> {
        try {
            const response = await axios.post<IBtsLoginResponse>(`${this.baseUrl}/auth/login`, {
                login: this.loginUser,
                password: this.passwordUser
            });

            if (response.data.status) {
                this.accessToken = response.data.data.access_token;
                this.refreshTokenValue = response.data.data.refresh_token;
            }
            return response.data;
        } catch (error) {
            console.error("BTS login failed:", safeErr(error));
            throw error;
        }
    }

    async refreshToken(): Promise<IBtsRefreshResponse> {
        try {
            if (!this.refreshTokenValue) {
                return await this.login();
            }

            const response = await axios.post<IBtsRefreshResponse>(`${this.baseUrl}/auth/refresh`, {
                refresh_token: this.refreshTokenValue
            }, {
                headers: {
                    "Authorization": `Bearer ${this.accessToken}`
                }
            });

            if (response.data.status) {
                this.accessToken = response.data.data.access_token;
                this.refreshTokenValue = response.data.data.refresh_token;
            }
            return response.data;
        } catch (error) {
            console.error("BTS token refresh failed:", safeErr(error));
            return await this.login();
        }
    }

    private async ensureAuth() {
        if (!this.accessToken) {
            await this.login();
        }
    }

    async getRegions(): Promise<IBtsResponse<IBtsRegion>> {
        try {
            await this.ensureAuth();

            const response = await axios.get<IBtsResponse<IBtsRegion>>(`${this.baseUrl}/v1/directory/regions`, {
                headers: {
                    "Authorization": `Bearer ${this.accessToken}`,
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "language": "uz"
                }
            });

            return response.data;
        } catch (error: any) {
            if (error?.response?.status === 401) {
                await this.refreshToken();
                return await this.getRegions();
            }
            console.error("Failed to fetch regions from BTS:", error?.response?.data || error.message);
            throw error;
        }
    }

    async getCities(regionCode: string): Promise<IBtsResponse<IBtsCity>> {
        try {
            await this.ensureAuth();

            const response = await axios.get<IBtsResponse<IBtsCity>>(`${this.baseUrl}/v1/directory/cities`, {
                params: { regionCode },
                headers: {
                    "Authorization": `Bearer ${this.accessToken}`,
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "language": "uz"
                }
            });

            return response.data;
        } catch (error: any) {
            if (error?.response?.status === 401) {
                await this.refreshToken();
                return await this.getCities(regionCode);
            }
            console.error(`Failed to fetch cities for region ${regionCode} from BTS:`, error?.response?.data || error.message);
            throw error;
        }
    };

    async createOrder(payload: ICreateOrderRequest): Promise<any> {
        try {
            await this.ensureAuth();
           
            const response = await axios.post(`${this.baseUrl}/v1/order/add`, payload, {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                }
            });

            return response.data;
        } catch (err) {
            if (isAxiosError(err) && err?.response?.status === 401) {
                await this.refreshToken();
                return await this.createOrder(payload);
            };
            console.log("createOrder-error: ", safeErr(err));
            if (isAxiosError(err)) {
                console.log("Axios Create order response data: ", err.response?.data?.errors);
                console.log("Axios Create order response data raw: ", err.response?.data?.errors?.raw);
                console.log("Axios Create order response data fields: ", err.response?.data?.errors?.fields);
            };
            throw err;
        }
    };

    async getState({ order_id }: { order_id: string }): Promise<IGetStateResponse> {
        try {
            await this.ensureAuth();

            const response = await axios.get(`${this.baseUrl}/v1/order/track?orderId=${order_id}`, {
                headers: {
                    "Authorization": `Bearer ${this.accessToken}`,
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "language": "uz"
                }
            });

            return response.data;
        } catch (error) {
            if (isAxiosError(error) && error?.response?.status === 401) {
                await this.refreshToken();
                return await this.getState({ order_id: order_id });
            };

            console.error("getState-error: ", safeErr(error));

            throw error;
        };
    };

    async calculateDeliveryCost(body: ICalculateDeliveryCostRequest): Promise<any> {
        try {
            // should return the cost of delivery based on the provided parameters
            const {
                senderCityCode,
                receiverCityCode,
                pickup_type,
                dropoff_type,
                is_multiple_cost,
                weight,
                volume
            } = body;
            await this.ensureAuth();

            const payload = {
                senderCityCode,
                receiverCityCode,
                pickup_type: pickup_type || "self",
                dropoff_type: dropoff_type || "self",
                is_multiple_cost: is_multiple_cost || 0,
                weight,
                volume,
            };

            console.log("the payload for calculating delivery cost: ", payload);

            const response = await axios.post(`${this.baseUrl}/v1/order-calculate/index`, payload, {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "language": "uz"
                }
            });

            console.log("the response for calculating delivery cost: ", response.data);

            if (response.data.data.branch_to_branch.available) {
                return response.data.data.branch_to_branch.price;
            } else {
                return 0;
            }
        } catch (error) {
            console.log("calculateDeliveryCost-error: ", safeErr(error));
            if (isAxiosError(error)) {
                console.log("Axios Calculate order delivery price response data: ", error.response?.data);
            };
            if (isAxiosError(error) && error?.response?.status === 401) {
                await this.refreshToken();
                return await this.calculateDeliveryCost(body);
            };
            throw error;
        }
    };
    async getBranches(body: IGetBranchesRequest): Promise<any> {
        try {
            await this.ensureAuth();
            const response = await axios.get(`${this.baseUrl}/v1/directory/branches?regionCode=${body.region_code}&cityCode=${body.city_code}`, {
                headers: {
                    "Authorization": `Bearer ${this.accessToken}`,
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "language": "uz"
                }
            })
            return response.data;
        } catch (err) {
            if (isAxiosError(err)) {
                if (err.response?.status === 401) {
                    await this.refreshToken();
                    return await this.getBranches(body);
                }
                console.log("error getBranches", err.response?.data);
            };
        }
    }

    async getDistance(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }): Promise<{ distanceKm: number; durationMin: number }> {
        const haversine = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
            const R = 6371;
            const dLat = ((b.lat - a.lat) * Math.PI) / 180;
            const dLng = ((b.lng - a.lng) * Math.PI) / 180;
            const lat1 = (a.lat * Math.PI) / 180;
            const lat2 = (b.lat * Math.PI) / 180;
            const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
            return 2 * R * Math.asin(Math.sqrt(h));
        };

        const fallback = () => {
            const km = haversine(origin, destination);
            return { distanceKm: km, durationMin: Math.round((km / 40) * 60) };
        };

        try {
            const routeUrl = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=false&steps=false`;
            const response = await axios.get(routeUrl, { timeout: 10000 });

            if (response.data?.code === "Ok" && response.data.routes?.[0]) {
                const distanceMeters = response.data.routes[0].distance;
                const durationSeconds = response.data.routes[0].duration;
                return {
                    distanceKm: Math.round((distanceMeters / 1000) * 10) / 10,
                    durationMin: Math.max(1, Math.round(durationSeconds / 60)),
                };
            }

            console.log("OSRM route not available, falling back to haversine:", response.data?.code);
            return fallback();
        } catch (error) {
            console.log("OSRM distance failed, falling back to haversine:", safeErr(error));
            return fallback();
        }
    }

};

export default new DeliveryService();;