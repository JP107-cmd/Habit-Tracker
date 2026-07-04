import express from "express";
import { 
    login,
    logout,
    getHabits, 
    createNewHabit,
    getHabit,
    updateHabit,
    deleteHabit,
    checkLogin,
    recordCompletion,
    isCompleted,
    undoCompletion,
    stats
 } from "../controller/controller"

export const router = express.Router();

router.post("/login", login)

router.get("/logout", logout)

router.get("/auth/me", checkLogin)

router.get("/all-habits", getHabits)

router.post("/new-habit", createNewHabit)

router.get("/:id", getHabit)

router.patch("/:id", updateHabit)

router.delete("/:id", deleteHabit)

router.post("/habit-completed", recordCompletion)

router.get("/is-completed/:id", isCompleted)

router.get("/stats/:id", stats)

router.post("/undo-completion", undoCompletion)