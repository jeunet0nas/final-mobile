import type { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";

export interface MenuItem {
  icon: ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle: string;
  onPress: () => void;
}

export const createMenuItems = (): Omit<MenuItem, "onPress">[] => [
  {
    icon: "person-circle-outline",
    title: "Thông tin cá nhân",
    subtitle: "Cập nhật thông tin của bạn",
  },
  {
    icon: "notifications-outline",
    title: "Thông báo",
    subtitle: "Quản lý thông báo",
  },
  {
    icon: "settings-outline",
    title: "Cài đặt",
    subtitle: "Tùy chỉnh ứng dụng",
  },
  {
    icon: "help-circle-outline",
    title: "Trợ giúp & Hỗ trợ",
    subtitle: "Câu hỏi thường gặp",
  },
];
