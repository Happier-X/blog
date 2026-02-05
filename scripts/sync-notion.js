import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import fs from "fs/promises";
import path from "path";

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
const POSTS_DIR = process.env.POSTS_DIR || "src/content/posts";

const notion = new Client({ auth: NOTION_API_KEY });
const n2m = new NotionToMarkdown({ notionClient: notion });

// 同步单个页面
async function syncPage(pageId) {
  const mdBlocks = await n2m.pageToMarkdown(pageId);
  const mdString = n2m.toMarkdownString(mdBlocks);

  // 获取页面属性
  const page = await notion.pages.retrieve({ page_id: pageId });
  const properties = page.properties;

  // 从 Notion 属性提取元数据
  // 注意：创建时间是 Notion 内置属性
  const title = properties.标题?.title?.[0]?.plain_text || "Untitled";
  const date = page.created_time || new Date().toISOString().split("T")[0];
  const description = properties.描述?.rich_text?.[0]?.plain_text || "";
  const category = properties.分类?.select?.name || "";
  const tags = properties.标签?.multi_select?.map((tag) => tag.name) || [];

  const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

  // 构建 frontmatter
  const frontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
date: "${new Date(date).toISOString().split("T")[0]}"
description: "${description.replace(/"/g, '\\"')}"
category: "${category}"
tags: [${tags.map((t) => `"${t}"`).join(", ")}]
slug: "${slug}"
---

`;

  // 文件名使用标题
  const filePath = path.join(POSTS_DIR, `${title}.md`);
  const fileContent = frontmatter + mdString.parent;

  // 确保目录存在
  await fs.mkdir(POSTS_DIR, { recursive: true });

  // 写入文件
  await fs.writeFile(filePath, fileContent, "utf-8");
  console.log(`✓ Synced: ${title}.md`);

  return title;
}

// 同步所有文章
async function syncAllPosts() {
  if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
    throw new Error("Missing NOTION_API_KEY or NOTION_DATABASE_ID environment variable");
  }

  console.log("🚀 Starting Notion to Markdown sync...\n");

  // 获取所有已发布的文章
  const response = await notion.databases.query({
    database_id: NOTION_DATABASE_ID,
    filter: {
      property: "发布",
      checkbox: {
        equals: true,
      },
    },
  });

  const syncedTitles = new Set();

  // 同步新文章和更新文章
  for (const page of response.results) {
    const pageId = page.id;
    try {
      const title = await syncPage(pageId);
      syncedTitles.add(title);
    } catch (error) {
      console.error(`✗ Failed to sync page ${pageId}:`, error.message);
    }
  }

  // 删除本地不存在的文章
  try {
    const files = await fs.readdir(POSTS_DIR);
    for (const file of files) {
      if (file.endsWith(".md")) {
        // 文件名就是标题
        const localTitle = file.replace(/\.md$/, "");
        if (!syncedTitles.has(localTitle)) {
          const filePath = path.join(POSTS_DIR, file);
          await fs.unlink(filePath);
          console.log(`🗑️  Deleted: ${file}`);
        }
      }
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Error checking local files:", error.message);
    }
  }

  console.log(`\n✅ Sync complete! Total: ${syncedTitles.size} posts`);
}

syncAllPosts().catch((error) => {
  console.error("Sync failed:", error);
  process.exit(1);
});
