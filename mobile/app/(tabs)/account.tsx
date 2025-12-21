import React from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useAccountHistory } from "@/hooks/useAccountHistory";
import { createMenuItems } from "@/constants/accountMenuItems";
import GuestAccountView from "@/components/account/GuestAccountView";
import LoggedInAccountView from "@/components/account/LoggedInAccountView";

export default function AccountScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;

  const {
    history,
    loadingHistory,
    refreshing,
    showAllHistory,
    handleRefresh,
    handleDeleteHistory,
    toggleShowAll,
    clearHistory,
  } = useAccountHistory(isLoggedIn);

  const handleMenuPress = (title: string) => {
    switch (title) {
      case "Thông tin cá nhân":
        router.push("/account/profile");
        break;
      case "Thông báo":
        router.push("/account/notifications");
        break;
      case "Cài đặt":
        router.push("/account/settings");
        break;
      case "Trợ giúp & Hỗ trợ":
        router.push("/account/help");
        break;
      default:
        console.log(title);
    }
  };

  const menuItems = createMenuItems().map((item) => ({
    ...item,
    onPress: () => handleMenuPress(item.title),
  }));

  const handleLogout = async () => {
    await logout();
    clearHistory();
  };

  if (!isLoggedIn) {
    return <GuestAccountView />;
  }

  return (
    <LoggedInAccountView
      user={user!}
      onLogout={handleLogout}
      history={history}
      loadingHistory={loadingHistory}
      refreshing={refreshing}
      showAllHistory={showAllHistory}
      onRefresh={handleRefresh}
      onDeleteHistory={handleDeleteHistory}
      onToggleShowAll={toggleShowAll}
      menuItems={menuItems}
    />
  );
}
