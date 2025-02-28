<template>
  <div id="tags-view-container" class="tags-view-container">
    <scroll-pane
      ref="scrollPaneRef"
      class="tags-view-wrapper"
      @scroll="handleScroll"
    >
      <router-link
        v-for="tag in visitedViews"
        :key="tag.path"
        :data-path="tag.path"
        :class="isActive(tag) ? 'active' : ''"
        :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath }"
        class="tags-view-item"
        :style="activeStyle(tag)"
        @click.middle="!isAffix(tag) ? closeSelectedTag(tag) : ''"
        @contextmenu.prevent="openMenu(tag, $event)"
      >
        {{ tag.title }}
        <span v-if="!isAffix(tag)" @click.prevent.stop="closeSelectedTag(tag)">
          <close
            class="el-icon-close"
            style="width: 1em; height: 1em; vertical-align: middle"
          />
        </span>
      </router-link>
    </scroll-pane>
    <ul
      v-show="visible"
      :style="{ left: left + 'px', top: top + 'px' }"
      class="contextmenu"
    >
      <li @click="refreshSelectedTag(selectedTag)">
        <refresh-right class="menu-icon" />
        <span class="menu-text">刷新页面</span>
      </li>
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">
        <close class="menu-icon" />
        <span class="menu-text">关闭当前</span>
      </li>
      <li @click="closeOthersTags">
        <circle-close class="menu-icon" />
        <span class="menu-text">关闭其他</span>
      </li>
      <li v-if="!isFirstView()" @click="closeLeftTags">
        <back class="menu-icon" />
        <span class="menu-text">关闭左侧</span>
      </li>
      <li v-if="!isLastView()" @click="closeRightTags">
        <right class="menu-icon" />
        <span class="menu-text">关闭右侧</span>
      </li>
      <li @click="closeAllTags(selectedTag)">
        <circle-close class="menu-icon" />
        <span class="menu-text">全部关闭</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import ScrollPane from "./ScrollPane";
import { getNormalPath } from "@/utils/ruoyi";
import useTagsViewStore from "@/store/modules/tagsView";
import useSettingsStore from "@/store/modules/settings";
import usePermissionStore from "@/store/modules/permission";

const visible = ref(false);
const top = ref(0);
const left = ref(0);
const selectedTag = ref({});
const affixTags = ref([]);
const scrollPaneRef = ref(null);

const { proxy } = getCurrentInstance();
const route = useRoute();
const router = useRouter();

const visitedViews = computed(() => useTagsViewStore().visitedViews);
const routes = computed(() => usePermissionStore().routes);
const theme = computed(() => useSettingsStore().theme);

watch(route, () => {
  addTags();
  moveToCurrentTag();
});

watch(visible, (value) => {
  if (value) {
    document.body.addEventListener("click", closeMenu);
  } else {
    document.body.removeEventListener("click", closeMenu);
  }
});

onMounted(() => {
  initTags();
  addTags();
});

function isActive(r) {
  return r.path === route.path;
}

function activeStyle(tag) {
  return {};
}

function isAffix(tag) {
  return tag.meta && tag.meta.affix;
}

function isFirstView() {
  try {
    return (
      selectedTag.value.fullPath === "/index" ||
      selectedTag.value.fullPath === visitedViews.value[1].fullPath
    );
  } catch (err) {
    return false;
  }
}

function isLastView() {
  try {
    return (
      selectedTag.value.fullPath ===
      visitedViews.value[visitedViews.value.length - 1].fullPath
    );
  } catch (err) {
    return false;
  }
}

function filterAffixTags(routes, basePath = "") {
  let tags = [];
  routes.forEach((route) => {
    if (route.meta && route.meta.affix) {
      const tagPath = getNormalPath(basePath + "/" + route.path);
      tags.push({
        fullPath: tagPath,
        path: tagPath,
        name: route.name,
        meta: { ...route.meta },
      });
    }
    if (route.children) {
      const tempTags = filterAffixTags(route.children, route.path);
      if (tempTags.length >= 1) {
        tags = [...tags, ...tempTags];
      }
    }
  });
  return tags;
}

function initTags() {
  const res = filterAffixTags(routes.value);
  affixTags.value = res;
  for (const tag of res) {
    // Must have tag name
    if (tag.name) {
      useTagsViewStore().addVisitedView(tag);
    }
  }
}

function addTags() {
  const { name } = route;
  if (name) {
    useTagsViewStore().addView(route);
  }
}

function moveToCurrentTag() {
  nextTick(() => {
    for (const r of visitedViews.value) {
      if (r.path === route.path) {
        scrollPaneRef.value.moveToTarget(r);
        // when query is different then update
        if (r.fullPath !== route.fullPath) {
          useTagsViewStore().updateVisitedView(route);
        }
      }
    }
  });
}

function refreshSelectedTag(view) {
  proxy.$tab.refreshPage(view);
  if (route.meta.link) {
    useTagsViewStore().delIframeView(route);
  }
}

function closeSelectedTag(view) {
  proxy.$tab.closePage(view).then(({ visitedViews }) => {
    if (isActive(view)) {
      toLastView(visitedViews, view);
    }
  });
}

function closeRightTags() {
  proxy.$tab.closeRightPage(selectedTag.value).then((visitedViews) => {
    if (!visitedViews.find((i) => i.fullPath === route.fullPath)) {
      toLastView(visitedViews);
    }
  });
}

function closeLeftTags() {
  proxy.$tab.closeLeftPage(selectedTag.value).then((visitedViews) => {
    if (!visitedViews.find((i) => i.fullPath === route.fullPath)) {
      toLastView(visitedViews);
    }
  });
}

function closeOthersTags() {
  router.push(selectedTag.value).catch(() => {});
  proxy.$tab.closeOtherPage(selectedTag.value).then(() => {
    moveToCurrentTag();
  });
}

function closeAllTags(view) {
  proxy.$tab.closeAllPage().then(({ visitedViews }) => {
    if (affixTags.value.some((tag) => tag.path === route.path)) {
      return;
    }
    toLastView(visitedViews, view);
  });
}

function toLastView(visitedViews, view) {
  const latestView = visitedViews.slice(-1)[0];
  if (latestView) {
    router.push(latestView.fullPath);
  } else {
    // now the default is to redirect to the home page if there is no tags-view,
    // you can adjust it according to your needs.
    if (view.name === "Dashboard") {
      // to reload home page
      router.replace({ path: "/redirect" + view.fullPath });
    } else {
      router.push("/");
    }
  }
}

function openMenu(tag, e) {
  const menuMinWidth = 120;
  const menuHeight = 220; // 估算的菜单高度
  const screenWidth = document.documentElement.clientWidth;
  const screenHeight = document.documentElement.clientHeight;

  // 获取鼠标位置
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  // 判断右侧空间是否足够
  const rightSpace = screenWidth - mouseX;
  const showOnRight = rightSpace >= menuMinWidth;

  // 设置菜单位置
  if (showOnRight) {
    // 在鼠标右侧显示
    left.value = mouseX + 5;
  } else {
    // 在鼠标左侧显示
    left.value = mouseX - menuMinWidth - 5;
  }

  // 确保菜单不会超出屏幕底部
  if (mouseY + menuHeight > screenHeight) {
    top.value = screenHeight - menuHeight - 5;
  } else {
    top.value = mouseY;
  }

  visible.value = true;
  selectedTag.value = tag;
}

function closeMenu() {
  visible.value = false;
}

function handleScroll() {
  closeMenu();
}
</script>

<style lang="scss" scoped>
.tags-view-container {
  height: 42px;
  width: 100%;
  background: var(--tags-bg, #fff);
  border-bottom: none;
  box-shadow: 0 1px 20px rgba(0, 0, 0, 0.05);
  padding: 0 12px;

  .tags-view-wrapper {
    .tags-view-item {
      display: inline-flex;
      align-items: center;
      height: 30px;
      line-height: 30px;
      padding: 0 16px;
      font-size: 13px;
      margin: 6px 4px;
      color: var(--tags-item-text, #666);
      background: transparent;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      user-select: none;
      position: relative;
      transition: all 0.25s cubic-bezier(0.3, 0, 0.2, 1);

      &::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: 6px;
        padding: 1px;
        background: linear-gradient(90deg, #fe2c55, #f12b4e);
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask: linear-gradient(#fff 0 0) content-box,
          linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        opacity: 0;
        transition: opacity 0.25s;
      }

      &:hover {
        color: #fe2c55;
        background: rgba(254, 44, 85, 0.04);

        &::before {
          opacity: 0.5;
        }

        .el-icon-close {
          opacity: 1;
          transform: scale(1);
        }
      }

      &.active {
        color: #fff;
        background: linear-gradient(90deg, #fe2c55, #f12b4e);
        border-color: transparent;
        font-weight: 500;
        transform: translateY(-1px);
        box-shadow: 0 4px 16px rgba(254, 44, 85, 0.25);

        &:focus,
        &:hover {
          color: #fff;
          background: linear-gradient(90deg, #fe2c55, #f12b4e);
          border-color: transparent;
        }
      }

      .el-icon-close {
        width: 16px;
        height: 16px;
        margin-left: 6px;
        border-radius: 50%;
        color: #999;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: all 0.25s cubic-bezier(0.3, 0, 0.2, 1);
        vertical-align: middle;
        transform-origin: center;

        &:hover {
          background: rgba(254, 44, 85, 0.1);
          color: #fe2c55;
          transform: scale(1.2);
        }
      }

      &:hover {
        .el-icon-close {
          opacity: 1;
        }
      }

      &.active {
        .el-icon-close {
          color: rgba(255, 255, 255, 0.9);

          &:hover {
            background: rgba(0, 0, 0, 0.2);
            color: #fff;
          }
        }
      }
    }
  }

  .contextmenu {
    margin: 0;
    background: rgba(255, 255, 255, 0.98);
    border: none;
    border-radius: 12px;
    padding: 6px;
    min-width: 180px;
    box-shadow: 0 4px 32px rgba(0, 0, 0, 0.1), 0 2px 16px rgba(0, 0, 0, 0.05);
    z-index: 3000;
    position: fixed;
    list-style: none;
    backdrop-filter: blur(20px);
    transform-origin: top left;
    animation: menuFadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    @keyframes menuFadeIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    li {
      display: flex;
      align-items: center;
      padding: 10px 16px;
      margin: 2px;
      font-size: 14px;
      color: #333;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      height: 42px;

      &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, #fe2c55, #f12b4e);
        opacity: 0;
        transition: opacity 0.2s;
      }

      .menu-icon {
        width: 18px;
        height: 18px;
        margin-right: 20px;
        position: relative;
        z-index: 1;
        transition: transform 0.2s;
        flex-shrink: 0;
      }

      .menu-text {
        position: relative;
        z-index: 1;
        flex-grow: 1;
        white-space: nowrap;
      }

      &:hover {
        color: #fff;
        transform: translateY(-1px);

        &::before {
          opacity: 1;
        }

        .menu-icon {
          transform: scale(1.1);
          filter: brightness(1.2);
        }
      }

      &:active {
        transform: scale(0.96);
      }
    }
  }
}

// 暗黑模式适配
html.dark {
  .tags-view-container {
    background: #141414;

    .tags-view-item {
      color: #999;

      &:hover {
        color: #ff4d4d;
        background: rgba(255, 77, 77, 0.1);
      }

      &.active {
        background: linear-gradient(90deg, #fe2c55, #f12b4e);
        color: #fff;
      }

      .el-icon-close:hover {
        background: rgba(255, 77, 77, 0.15);
        color: #ff4d4d;
      }
    }

    .contextmenu {
      background: rgba(29, 29, 29, 0.98);
      box-shadow: 0 4px 32px rgba(0, 0, 0, 0.2), 0 2px 16px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.08);

      li {
        color: #e5e5e5;

        .menu-icon {
          opacity: 0.9;
        }

        &:hover {
          background: none;

          &::before {
            opacity: 1;
          }

          .menu-icon {
            opacity: 1;
          }
        }
      }
    }
  }
}
</style>

<style lang="scss">
//reset element css of el-icon-close
.tags-view-wrapper {
  .tags-view-item {
    .el-icon-close {
      width: 16px !important;
      height: 16px !important;
      border-radius: 50%;
      text-align: center;

      &:before {
        transform: scale(0.6);
        display: inline-block;
      }
    }
  }
}
</style>
