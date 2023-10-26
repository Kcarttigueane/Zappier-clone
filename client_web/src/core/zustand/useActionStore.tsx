import { HttpStatusCode } from 'axios';
import { create } from 'zustand';
import { apiV2, getApiHeaders } from '../api';
import { ActionModelDTO } from '../models/action';
import { ServiceModelDTO } from '../models/service';
import { TriggerModelDTO } from '../models/trigger';

type ActionState = {
	actions: ActionModelDTO[];
	actionsAssociatedToTrigger: ActionModelDTO[];
	isLoading: boolean;
};

type ActionActions = {
	clearActions: () => void;
	fetchActions: () => Promise<void>;
	fetchActionsByTriggerId: (serviceId: ServiceModelDTO['id'], triggerId: TriggerModelDTO['id']) => Promise<void>;
};

const initialState: ActionState = {
	actions: [],
	actionsAssociatedToTrigger: [],
	isLoading: false,
};

const useActionStore = create<ActionState & ActionActions>()((set) => ({
	...initialState,
	fetchActions: async () => {
		set({ isLoading: true });
		const accessToken = localStorage.getItem('access_token');
		if (!accessToken) {
			throw new Error('No access token found');
		}
		try {
			const response = await apiV2.get('/actions/', { headers: getApiHeaders(accessToken) });

			if (response.status === HttpStatusCode.Ok && response.data) {
				console.info(response.data);
				set({ actions: response.data, isLoading: false });
			}
		} catch (error: any) {
			console.error('Error fetching current action:', error);
			throw error;
		} finally {
			set({ isLoading: false });
		}
	},
	fetchActionsByTriggerId: async (serviceId: ServiceModelDTO['id'], triggerId: TriggerModelDTO['id']) => {
		set({ isLoading: true });
		try {
			const accessToken = localStorage.getItem('access_token');
			if (!accessToken) {
				throw new Error('No access token found');
			}

			console.log('serviceId', serviceId);
			console.log('triggerId', triggerId);
			const response = await apiV2.get(`/actions/${triggerId}/triggers`, {
				params: {
					service_id: serviceId,
				},
				headers: getApiHeaders(accessToken),
			});

			if (response.status === HttpStatusCode.Ok && response.data) {
				console.info(response.data);
				set({ actionsAssociatedToTrigger: response.data, isLoading: false });
			}
		} catch (error: any) {
			console.error('Error fetching current action:', error);
			throw error;
		} finally {
			set({ isLoading: false });
		}
	},
	clearActions: () => set(() => ({ actions: [], actionsAssociatedToTrigger: [] })),
}));

export default useActionStore;
