import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

const store = (set) => ({
  loader: true,
  isLoggedIn: false,
  boards: [],
  areBoardsFetched: false,
  toastrMsg: "",
  setToastrMsg: (msg) => set({ toastrMsg }, false, "setToastr"),
  setBoards: boards => set ({boards, areBoardsFetched: true}, false, "setBoards"),
  addBoard: board => set (old => ({boards: [board, ...old.boards]})),
  setLoginStatus: (status) => set({
    isLoggedIn: status,
    loader: false,
  }, false, "setLoginStatus"),
});

const useStore = create(devtools(store));

export default useStore; // ✅ Default export
