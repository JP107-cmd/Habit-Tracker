import express from "express";
import { 
    login,
    logout,
    getHabits, 
    createNewHabit,
    getHabit,
    updateHabit,
    deleteHabit
 } from "../controller/controller"

export const router = express.Router();

router.post("/login", login)


router.get("/logout", logout)


router.get("/all-habits", getHabits)

router.post("/new-habit", createNewHabit)

router.get("/:id", getHabit)

router.patch("/:id", updateHabit)

router.delete("/:id", deleteHabit)

/*
add completion records later
router.post("/habit-completed")
*/