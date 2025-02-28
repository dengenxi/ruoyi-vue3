<template>
  <div class="dashboard-container">
    <!-- 主横幅区域 -->
    <div class="hero-banner">
      <div class="hero-content">
        <div class="hero-text">
          <div class="logo-text">RuoYi-Vue3</div>
          <div class="slogan">
            <span class="highlight">快速</span>
            <span class="highlight">优雅</span>
            <span class="highlight">专业</span>
            的中后台解决方案
          </div>
        </div>
        <div class="hero-actions">
          <el-button-group class="action-group">
            <el-button
              type="danger"
              class="action-btn primary"
              @click="goTarget('https://gitee.com/y_project/RuoYi-Vue')"
            >
              开始使用
            </el-button>
            <el-button
              type="danger"
              class="action-btn"
              @click="goTarget('http://doc.ruoyi.vip')"
            >
              在线文档
            </el-button>
          </el-button-group>
          <div class="version-info">
            <el-tag effect="dark" class="version-tag">
              Latest v{{ version }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="quick-entries">
      <div class="entry-card" v-for="entry in quickEntries" :key="entry.title">
        <div class="entry-icon">
          <el-icon><component :is="entry.icon" /></el-icon>
        </div>
        <div class="entry-content">
          <h3>{{ entry.title }}</h3>
          <p>{{ entry.desc }}</p>
        </div>
        <el-button
          type="danger"
          text
          class="entry-action"
          @click="entry.action"
        >
          {{ entry.actionText }}
          <el-icon class="el-icon--right"><ArrowRight /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 技术栈展示 -->
    <div class="features">
      <div
        class="feature-group"
        v-for="(group, index) in features"
        :key="index"
      >
        <div class="group-header">
          <h3>{{ group.title }}</h3>
          <div class="group-tags">
            <el-tag
              v-for="tag in group.tags"
              :key="tag"
              type="danger"
              effect="plain"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
        <div class="feature-list">
          <div
            v-for="(item, idx) in group.items"
            :key="idx"
            class="feature-item"
          >
            <div class="feature-icon" :style="{ background: item.color }">
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <div class="feature-content">
              <h4>{{ item.name }}</h4>
              <p>{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="Index">
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  Setting,
  Monitor,
  Lock,
  DataLine,
  Platform,
  Document,
  Share,
  Box,
  User,
  Tools,
  Guide,
  ArrowRight,
} from "@element-plus/icons-vue";

const router = useRouter();
const version = ref("3.8.9");

// 快捷入口
const quickEntries = [
  {
    title: "用户管理",
    desc: "添加、编辑、删除系统用户，分配角色和权限",
    icon: User,
    actionText: "立即管理",
    action: () => router.push("/system/user"),
  },
  {
    title: "系统工具",
    desc: "代码生成器、系统接口、数据监控等开发工具",
    icon: Tools,
    actionText: "查看工具",
    action: () => router.push("/tool/gen"),
  },
  {
    title: "操作指南",
    desc: "了解系统功能，快速上手使用指南",
    icon: Guide,
    actionText: "开始阅读",
    action: () => goTarget("http://doc.ruoyi.vip"),
  },
];

const features = [
  {
    title: "后端技术栈",
    tags: ["高性能", "易扩展"],
    items: [
      {
        name: "Spring Boot",
        desc: "企业级开发框架",
        icon: Box,
        color: "#6DB33F",
      },
      {
        name: "Spring Security",
        desc: "安全认证框架",
        icon: Lock,
        color: "#6DB33F",
      },
      { name: "MyBatis", desc: "持久层框架", icon: DataLine, color: "#FF2C54" },
      { name: "Redis", desc: "高性能缓存", icon: Setting, color: "#DC382D" },
    ],
  },
  {
    title: "前端技术栈",
    tags: ["现代化", "组件化"],
    items: [
      { name: "Vue 3", desc: "渐进式框架", icon: Platform, color: "#42B883" },
      {
        name: "Element Plus",
        desc: "UI组件库",
        icon: Monitor,
        color: "#409EFF",
      },
      {
        name: "TypeScript",
        desc: "类型增强",
        icon: Document,
        color: "#3178C6",
      },
      { name: "Vite", desc: "开发构建工具", icon: Share, color: "#646CFF" },
    ],
  },
];

function goTarget(url) {
  window.open(url, "__blank");
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 24px;
  min-height: calc(100vh - 84px);
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);

  // 主横幅
  .hero-banner {
    position: relative;
    background: var(--el-bg-color-overlay);
    border-radius: 24px;
    padding: 48px;
    margin-bottom: 24px;
    overflow: hidden;
    box-shadow: var(--el-box-shadow-light);

    &::before {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      width: 50%;
      height: 100%;
      background: linear-gradient(
        135deg,
        rgba(254, 44, 85, 0.1) 0%,
        rgba(254, 44, 85, 0.05) 100%
      );
      filter: blur(50px);
    }

    .hero-content {
      position: relative;
      z-index: 1;

      .hero-text {
        margin-bottom: 40px;

        .logo-text {
          font-size: 48px;
          font-weight: 700;
          margin-bottom: 16px;
          background: linear-gradient(to right, #fe2c55, #ff4d4d);
          -webkit-background-clip: text;
          color: transparent;
        }

        .slogan {
          font-size: 24px;
          color: var(--el-text-color-secondary);

          .highlight {
            color: #fe2c55;
            margin-right: 8px;
            font-weight: 500;
          }
        }
      }

      .hero-actions {
        display: flex;
        align-items: center;
        gap: 24px;

        .action-btn {
          padding: 12px 32px;
          font-size: 16px;
          font-weight: 500;
          border: none;
          transition: all 0.3s;

          &.primary {
            background: #fe2c55;

            &:hover {
              background: #ff4d4d;
              transform: translateY(-2px);
            }
          }

          &:not(.primary) {
            background: rgba(254, 44, 85, 0.1);
            color: #fe2c55;

            &:hover {
              background: rgba(254, 44, 85, 0.15);
              transform: translateY(-2px);
            }
          }
        }

        .version-tag {
          background: rgba(254, 44, 85, 0.1);
          border: none;
          color: #fe2c55;
        }
      }
    }
  }

  // 快捷入口
  .quick-entries {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-bottom: 24px;

    .entry-card {
      background: var(--el-bg-color-overlay);
      border-radius: 16px;
      padding: 24px;
      position: relative;
      transition: all 0.3s;
      box-shadow: var(--el-box-shadow-light);

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--el-box-shadow);

        .entry-icon {
          transform: scale(1.1);
        }
      }

      .entry-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: rgba(254, 44, 85, 0.1);
        color: #fe2c55;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        margin-bottom: 16px;
        transition: all 0.3s;
      }

      .entry-content {
        margin-bottom: 16px;

        h3 {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 8px;
          color: var(--el-text-color-primary);
        }

        p {
          font-size: 14px;
          color: var(--el-text-color-secondary);
          margin: 0;
          line-height: 1.5;
        }
      }

      .entry-action {
        color: #fe2c55;
        font-weight: 500;
      }
    }
  }

  // 特性展示
  .features {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;

    .feature-group {
      background: var(--el-bg-color-overlay);
      border-radius: 16px;
      padding: 32px;
      box-shadow: var(--el-box-shadow-light);

      .group-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;

        h3 {
          font-size: 20px;
          font-weight: 600;
          margin: 0;
          color: var(--el-text-color-primary);
        }

        .group-tags {
          display: flex;
          gap: 8px;
        }
      }

      .feature-list {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 24px;

        .feature-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border-radius: 12px;
          background: var(--el-fill-color-blank);
          transition: all 0.3s;

          &:hover {
            transform: translateY(-2px);
            box-shadow: var(--el-box-shadow-light);
          }

          .feature-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 20px;
          }

          .feature-content {
            h4 {
              font-size: 15px;
              font-weight: 500;
              margin: 0 0 4px;
              color: var(--el-text-color-primary);
            }

            p {
              font-size: 13px;
              color: var(--el-text-color-secondary);
              margin: 0;
            }
          }
        }
      }
    }
  }
}
</style>
