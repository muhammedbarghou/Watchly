import { getDatabase, ref, set, get, update, remove, child } from "firebase/database";

const db = getDatabase();

export const createRoom = async (roomId, roomData) => {
  try {
    const roomRef = ref(db, 'rooms/' + roomId);
    const newRoom = {
      roomName: roomData.roomName,
      roomId :roomData.roomId,
      password: roomData.password,
      videoLink: roomData.videoLink,
      createdAt: new Date().toISOString(),
    };
    await set(roomRef, newRoom);
    console.log("Room created successfully");
    return newRoom;
  } catch (error) {
    console.error("Error creating room:", error);
    throw new Error("Failed to create room");
  }
};

// Function to get a room's details by its ID
export const getRoom = async (roomId) => {
  try {
    const roomRef = ref(db, 'rooms/' + roomId);
    const roomSnapshot = await get(roomRef);
    if (roomSnapshot.exists()) {
      return roomSnapshot.val();
    } else {
      console.warn("Room not found");
      return null;
    }
  } catch (error) {
    console.error("Error fetching room:", error);
    throw new Error("Failed to fetch room details");
  }
};

// Function to update a room's data
export const updateRoom = async (roomId, updatedData) => {
  try {
    const roomRef = ref(db, 'rooms/' + roomId);
    await update(roomRef, updatedData);
    console.log("Room updated successfully");
  } catch (error) {
    console.error("Error updating room:", error);
    throw new Error("Failed to update room");
  }
};

// Function to delete a room
export const deleteRoom = async (roomId) => {
  try {
    const roomRef = ref(db, 'rooms/' + roomId);
    await remove(roomRef);
    console.log("Room deleted successfully");
  } catch (error) {
    console.error("Error deleting room:", error);
    throw new Error("Failed to delete room");
  }
};

// Function to join a room by ID and password
export const joinRoom = async (roomId, inputPassword) => {
  try {
    const roomRef = ref(db, 'rooms/' + roomId);
    const roomSnapshot = await get(roomRef);
    if (roomSnapshot.exists()) {
      const roomData = roomSnapshot.val();
      if (roomData.password === inputPassword) {
        console.log("Access granted to the room");
        return roomData;
      } else {
        console.warn("Incorrect password");
        throw new Error("Incorrect room password");
      }
    } else {
      console.warn("Room not found");
      throw new Error("Room not found");
    }
  } catch (error) {
    console.error("Error joining room:", error);
    throw error;
  }
};
