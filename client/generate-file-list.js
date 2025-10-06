import fs from 'fs';
import path from 'path';

// 定义 public 文件夹路径
const publicDir = '/public/reports';

// 扫描 public 文件夹中的 .csv 文件
const files = fs.readdirSync(publicDir).filter(file => file.endsWith('.csv'));

// 定义 file-list.json 文件路径
const fileListPath = path.join(publicDir, 'file-list.json');

// 将文件列表写入 file-list.json 文件
fs.writeFileSync(fileListPath, JSON.stringify(files, null, 2));

console.log(`file-list.json 文件已成功生成在 ${publicDir} 文件夹中。`);