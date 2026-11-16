import httpClient from '../httpClient';

export interface IWorker {
  id: number;
  name: string;
  phone: string;
  role: string;
  tg_id: string;
  factory_id: number;
  factory?: { id: number; name: string };
  createdAt: string;
}
export interface IWorkerInput {
  name: string;
  phone: string;
  role: string;
  tg_id: string;
  factory_id: number;
}

export const getAllWorkers = async (): Promise<IWorker[]> =>
  (await httpClient.get('/factory/workers/all')).data.workers;
export const createWorker = async (data: IWorkerInput) =>
  (await httpClient.post('/factory/workers/admin', data)).data;
export const updateWorker = async ({
  id,
  ...data
}: Partial<IWorkerInput> & { id: number }) =>
  (await httpClient.put(`/factory/workers/admin/${id}`, data)).data;
export const deleteWorker = async (id: number) =>
  (await httpClient.delete(`/factory/workers/admin/${id}`)).data;
export const getFactoriesShort = async (): Promise<
  { id: number; name: string }[]
> =>
  (await httpClient.get('/factory')).data.data.map(
    (f: { id: number; name: string }) => ({ id: f.id, name: f.name }),
  );
