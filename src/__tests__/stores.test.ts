import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "@/stores/app-store";

describe("App Store", () => {
  beforeEach(() => {
    useAppStore.setState({
      currentModule: "dashboard",
      sidebarOpen: true,
      theme: "dark",
      isLoading: false,
      error: null,
      notifications: [],
    });
  });

  it("should set current module", () => {
    useAppStore.getState().setCurrentModule("crisis");
    expect(useAppStore.getState().currentModule).toBe("crisis");
  });

  it("should toggle sidebar", () => {
    useAppStore.getState().toggleSidebar();
    expect(useAppStore.getState().sidebarOpen).toBe(false);
    useAppStore.getState().toggleSidebar();
    expect(useAppStore.getState().sidebarOpen).toBe(true);
  });

  it("should set theme", () => {
    useAppStore.getState().setTheme("light");
    expect(useAppStore.getState().theme).toBe("light");
  });

  it("should manage loading state", () => {
    useAppStore.getState().setLoading(true);
    expect(useAppStore.getState().isLoading).toBe(true);
    useAppStore.getState().setLoading(false);
    expect(useAppStore.getState().isLoading).toBe(false);
  });

  it("should manage error state", () => {
    useAppStore.getState().setError("Something went wrong");
    expect(useAppStore.getState().error).toBe("Something went wrong");
    useAppStore.getState().setError(null);
    expect(useAppStore.getState().error).toBeNull();
  });

  it("should add and dismiss notifications", () => {
    useAppStore.getState().addNotification({
      type: "warning",
      title: "Alerta",
      message: "Nível de água elevado",
    });

    const notifications = useAppStore.getState().notifications;
    expect(notifications).toHaveLength(1);
    expect(notifications[0].title).toBe("Alerta");
    expect(notifications[0].type).toBe("warning");
    expect(notifications[0].id).toBeTruthy();

    useAppStore.getState().dismissNotification(notifications[0].id);
    expect(useAppStore.getState().notifications).toHaveLength(0);
  });

  it("should clear all notifications", () => {
    useAppStore.getState().addNotification({ type: "info", title: "Test 1", message: "msg" });
    useAppStore.getState().addNotification({ type: "error", title: "Test 2", message: "msg" });
    expect(useAppStore.getState().notifications).toHaveLength(2);

    useAppStore.getState().clearNotifications();
    expect(useAppStore.getState().notifications).toHaveLength(0);
  });
});
