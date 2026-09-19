const fs = require('fs');
const db = JSON.parse(fs.readFileSync('data/db.json', 'utf8'));
const configJson = JSON.stringify(db.systemConfig).replace(/'/g, "''");

['database.sql', 'public/database.sql'].forEach(file => {
  if (fs.existsSync(file)) {
    let sql = fs.readFileSync(file, 'utf8');
    const startPattern = /INSERT INTO `system_config` \(`id`, `config`, `updated_at`\)\s*VALUES\s*\(1,\s*'/;
    const match = sql.match(startPattern);
    if (match) {
      const startIndex = match.index + match[0].length;
      const endMarker = "', NOW())\nON DUPLICATE KEY UPDATE";
      const endIndex = sql.indexOf(endMarker, startIndex);
      if (endIndex !== -1) {
        sql = sql.slice(0, startIndex) + configJson + sql.slice(endIndex);
        fs.writeFileSync(file, sql, 'utf8');
        console.log('Successfully updated', file);
      } else {
        console.log('endMarker not found in', file);
      }
    } else {
      console.log('startPattern not matched in', file);
    }
  }
});
