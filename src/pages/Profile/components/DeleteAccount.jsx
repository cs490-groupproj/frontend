import React, { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase.js";
import usePostToAPI from "@/hooks/usePostToAPI";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogMedia,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2Icon, Loader2 } from "lucide-react";

const DeleteAccount = () => {
  const { socket } = useOutletContext();
  const navigate = useNavigate();
  const userID = localStorage.getItem("userId");
  const {
    postFunction,
    loading: deleteLoading,
    error: deleteError,
  } = usePostToAPI();

  const handleDeleteAccount = async (event) => {
    event.preventDefault();
    try {
      await postFunction(`/users/${userID}/delete_account`);
      await handleSignOut();
    } catch (err) {
      console.error("Failed to delete account.", err);
    }
  };

  const handleSignOut = async () => {
    try {
      if (socket) {
        socket.disconnect();
      }
      await signOut(auth);
    } catch (err) {
      console.error("Sign out failed:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("activeMode");
      navigate("/login", { replace: true });
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete Account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia
            className="bg-destructive/10 text-destructive dark:bg-destructive/20
              dark:text-destructive"
          >
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete Account?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex flex-col gap-3">
          {deleteError && (
            <div className="text-destructive w-full rounded-md p-2 text-sm">
              error: {deleteError}
            </div>
          )}

          <div className="flex w-full justify-end gap-2">
            <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleDeleteAccount(event);
              }}
              variant="destructive"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAccount;
