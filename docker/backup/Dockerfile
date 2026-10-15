FROM postgres:16-alpine
RUN apk add --no-cache curl rclone restic
ENV RCLONE_CONFIG=/var/lib/backup/rclone.conf \
    RESTIC_CACHE_DIR=/var/lib/backup/cache
COPY --chmod=755 entrypoint.sh /usr/local/bin/entrypoint
COPY --chmod=755 backup.sh /usr/local/bin/backup
COPY --chmod=755 restore.sh /usr/local/bin/restore
ENTRYPOINT ["entrypoint"]
CMD []
