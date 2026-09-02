import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedNav } from "../../../redux/reducers/app.reducer";
import {
  getChildBadgeCount,
  getParentNavId,
  getPermittedWorklistChildren,
  getWorklistTitle,
  isWorklistNav,
  selectWorklistNav,
} from "../../../utils/worklistNav";
import { isPrivilegedRole } from "../../../utils/accessFilters";

const formatCount = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toLocaleString("en-US") : "0";
};

const WorklistTabs = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.app.theme);
  const selectedNav = useSelector((state) => state.app.selectedNav) || "home";
  const tags = useSelector((state) => state.tags.allTags);
  const navGrouped = useSelector((state) => state.app.navGrouped) || {};
  const navPendCounts = useSelector((state) => state.app.navPendCounts) || {};
  const role = useSelector((state) => state.auth.role);
  const accessDenialCategory = useSelector((state) => state.auth.denialCategory);
  const denialTabIds = useSelector((state) => state.app.denialTabIds) || [];
  const privileged = isPrivilegedRole(role);
  const isDark = theme === "dark";
  const parentId = getParentNavId(selectedNav);
  const permittedChildren = useMemo(
    () => getPermittedWorklistChildren(parentId, accessDenialCategory, privileged),
    [parentId, accessDenialCategory, privileged]
  );

  const visibleTabs = useMemo(() => {
    if (parentId === "denials") {
      const selected = new Set(denialTabIds);
      return permittedChildren.filter((child) => selected.has(child.id));
    }
    return permittedChildren;
  }, [parentId, permittedChildren, denialTabIds]);

  if (!isWorklistNav(selectedNav)) return null;

  const activateTab = (childId) => {
    if (selectedNav === childId) return;
    dispatch(setSelectedNav(childId));
    selectWorklistNav({
      dispatch,
      navId: childId,
      tags,
      title: getWorklistTitle(childId),
    });
  };

  const tabClass = (active) => {
    if (active) {
      return isDark
        ? "text-white border-[#4B9187]"
        : "text-slate-900 border-[#4B9187]";
    }
    return isDark
      ? "text-[rgba(244,244,244,0.55)] border-transparent hover:text-white/80"
      : "text-slate-500 border-transparent hover:text-slate-800";
  };

  return (
    <div className="mb-4">
      {visibleTabs.length > 0 && (
        <div
          className={`flex items-end gap-6 overflow-x-auto border-b ${
            isDark ? "border-white/10" : "border-slate-200"
          }`}
        >
          {visibleTabs.map((child) => {
            const active = selectedNav === child.id;
            const count = getChildBadgeCount(child, navGrouped, navPendCounts);
            return (
              <button
                key={child.id}
                type="button"
                onClick={() => activateTab(child.id)}
                className={`shrink-0 whitespace-nowrap pb-3 text-sm font-medium border-b-2 transition-colors ${tabClass(active)}`}
              >
                {child.title} ({formatCount(count)})
              </button>
            );
          })}
        </div>
      )}

      {parentId === "denials" && visibleTabs.length === 0 && (
        <p className={`text-sm ${isDark ? "text-white/50" : "text-slate-500"}`}>
          Select denial categories in the sidebar to open them as tabs.
        </p>
      )}
    </div>
  );
};

export default WorklistTabs;
