import React from "react";
import DepartmentSettingsScreen from "./settings";

/**
 * Profile page — delegates to Settings page to avoid duplication.
 * Both pages render the same ProfileAndSettings component with a logout button.
 */
export default function DepartmentProfile() {
  return <DepartmentSettingsScreen />;
}
