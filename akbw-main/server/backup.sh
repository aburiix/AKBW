#!/bin/sh

# Backup script for PostgreSQL database
# This script should be run daily via crontab

# Configuration
DB_CONTAINER="akbw-db"
DB_USER="postgres"
DB_NAME="akbw"
BACKUP_DIR="/app/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/akbw_backup_${DATE}.sql"
RETENTION_DAYS=7

# Create backup directory if it doesn't exist
mkdir -p ${BACKUP_DIR}

# Perform backup
echo "Starting backup at $(date)"
docker exec ${DB_CONTAINER} pg_dump -U ${DB_USER} ${DB_NAME} > ${BACKUP_FILE}

# Compress backup
gzip ${BACKUP_FILE}
BACKUP_FILE="${BACKUP_FILE}.gz"

# Remove backups older than retention days
find ${BACKUP_DIR} -name "akbw_backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete

echo "Backup completed: ${BACKUP_FILE}"
echo "Old backups (older than ${RETENTION_DAYS} days) removed"
