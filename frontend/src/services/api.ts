import axios from "axios";


// `/api` is proxied to `http://localhost:8000`
const http = axios.create({ baseURL: "/api" });

export interface ActionDTO {
    id: number;
    action: string;
    date: string;
    points: number;
}


export const api = {
    async list(): Promise<ActionDTO[]> {
        const { data } = await http.get<ActionDTO[]>("/actions/");
        return data;
    },

    async create(payload: Omit<ActionDTO, "id">) {
        await http.post("/actions/", payload);
    },

    async update(id: number, payload: Partial<Omit<ActionDTO, "id">>) {
        await http.patch(`/actions/${id}/`, payload);
    },

    async remove(id: number) {
        await http.delete(`/actions/${id}/`);
    },
};
