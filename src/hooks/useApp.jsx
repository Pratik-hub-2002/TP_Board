import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { getAuth } from 'firebase/auth'
import useStore from '../store'

const useApp = () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
        throw new Error('User must be authenticated to use this hook');
    }
    
    const boardsColRef = collection(db, 'boards');
    const { setBoards } = useStore();

    const createBoard = async (boardData) => {
        try {
            const newBoard = {
                ...boardData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            await addDoc(boardsColRef, newBoard);
        } catch (err) {
            console.error('Error creating board:', err);
            throw err;
        }
    }

    const fetchBoards = async (setLoading) => {
        try {
            const currentUser = getAuth().currentUser;
            if (!currentUser) {
                setBoards([]);
                return;
            }
            
            const querySnapshot = await getDocs(boardsColRef);
            const boards = querySnapshot.docs
                .filter(doc => {
                    const data = doc.data();
                    return data.members && data.members.includes(currentUser.uid);
                })
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
            setBoards(boards);
            if (setLoading) setLoading(false);
        } catch (err) {
            console.log(err);
            throw err;
        }
    }
    
    return { createBoard, fetchBoards };    
}

export default useApp