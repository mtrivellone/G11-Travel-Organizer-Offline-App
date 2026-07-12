export type Day = {
  id: string; tripId: string; title: string; date: string; place: string; order: number; notes: string;
};

export type ActivityStatus = 'todo' | 'done' | 'cancelled';

export type Activity = {
  id: string; dayId: string; title: string; time: string; // "HH:mm"
  place: string; category: string; cost: number; status: ActivityStatus;
};