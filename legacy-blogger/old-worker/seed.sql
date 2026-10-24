-- Utilityra Data Hub seed v1.
-- All rows start as draft and collections remain private until source review is completed.
-- Do not mark rows verified or make collections public without checking the official source.

INSERT OR IGNORE INTO source_registry
  (source_key, name, base_url, source_type, license_notes, allowed)
VALUES
  ('iana-media-types', 'IANA Media Types Registry',
   'https://www.iana.org/assignments/media-types/media-types.xhtml',
   'dataset', 'Verify each media type against the current registry. File-extension mappings are conventions and need separate validation.', 0);

INSERT OR IGNORE INTO data_collections
  (collection_key, title_en, title_ar, description_en, description_ar, schema_version, is_public)
VALUES
  ('mime-types', 'MIME Types and File Extensions', 'أنواع MIME وامتدادات الملفات',
   'A curated reference for common media types and file extensions. Draft records must be verified before public release.',
   'مرجع لأنواع الوسائط وامتدادات الملفات الشائعة. يجب التحقق من السجلات قبل نشرها للعامة.', 1, 0);

INSERT OR IGNORE INTO data_records
  (collection_id, record_key, title, summary, payload_json, source_id, source_url, license_notes, status)
VALUES
  ((SELECT id FROM data_collections WHERE collection_key='mime-types'), 'html', 'HTML document (.html)', 'Common media type for HTML documents.', '{"extension":".html","mime":"text/html","category":"text"}', (SELECT id FROM source_registry WHERE source_key='iana-media-types'), 'https://www.iana.org/assignments/media-types/media-types.xhtml', 'Draft: verify media type and extension mapping.', 'draft'),
  ((SELECT id FROM data_collections WHERE collection_key='mime-types'), 'css', 'CSS stylesheet (.css)', 'Common media type for CSS stylesheets.', '{"extension":".css","mime":"text/css","category":"text"}', (SELECT id FROM source_registry WHERE source_key='iana-media-types'), 'https://www.iana.org/assignments/media-types/media-types.xhtml', 'Draft: verify media type and extension mapping.', 'draft'),
  ((SELECT id FROM data_collections WHERE collection_key='mime-types'), 'javascript', 'JavaScript (.js)', 'Common media type for JavaScript source files.', '{"extension":".js","mime":"text/javascript","category":"text"}', (SELECT id FROM source_registry WHERE source_key='iana-media-types'), 'https://www.iana.org/assignments/media-types/media-types.xhtml', 'Draft: verify media type and extension mapping.', 'draft'),
  ((SELECT id FROM data_collections WHERE collection_key='mime-types'), 'json', 'JSON data (.json)', 'Common media type for JSON documents.', '{"extension":".json","mime":"application/json","category":"data"}', (SELECT id FROM source_registry WHERE source_key='iana-media-types'), 'https://www.iana.org/assignments/media-types/media-types.xhtml', 'Draft: verify media type and extension mapping.', 'draft'),
  ((SELECT id FROM data_collections WHERE collection_key='mime-types'), 'xml', 'XML document (.xml)', 'Common media type for XML documents.', '{"extension":".xml","mime":"application/xml","category":"data"}', (SELECT id FROM source_registry WHERE source_key='iana-media-types'), 'https://www.iana.org/assignments/media-types/media-types.xhtml', 'Draft: verify media type and extension mapping.', 'draft'),
  ((SELECT id FROM data_collections WHERE collection_key='mime-types'), 'csv', 'CSV data (.csv)', 'Common media type for comma-separated values.', '{"extension":".csv","mime":"text/csv","category":"data"}', (SELECT id FROM source_registry WHERE source_key='iana-media-types'), 'https://www.iana.org/assignments/media-types/media-types.xhtml', 'Draft: verify media type and extension mapping.', 'draft'),
  ((SELECT id FROM data_collections WHERE collection_key='mime-types'), 'pdf', 'PDF document (.pdf)', 'Common media type for PDF documents.', '{"extension":".pdf","mime":"application/pdf","category":"document"}', (SELECT id FROM source_registry WHERE source_key='iana-media-types'), 'https://www.iana.org/assignments/media-types/media-types.xhtml', 'Draft: verify media type and extension mapping.', 'draft'),
  ((SELECT id FROM data_collections WHERE collection_key='mime-types'), 'zip', 'ZIP archive (.zip)', 'Common media type for ZIP archives.', '{"extension":".zip","mime":"application/zip","category":"archive"}', (SELECT id FROM source_registry WHERE source_key='iana-media-types'), 'https://www.iana.org/assignments/media-types/media-types.xhtml', 'Draft: verify media type and extension mapping.', 'draft'),
  ((SELECT id FROM data_collections WHERE collection_key='mime-types'), 'png', 'PNG image (.png)', 'Common media type for PNG images.', '{"extension":".png","mime":"image/png","category":"image"}', (SELECT id FROM source_registry WHERE source_key='iana-media-types'), 'https://www.iana.org/assignments/media-types/media-types.xhtml', 'Draft: verify media type and extension mapping.', 'draft'),
  ((SELECT id FROM data_collections WHERE collection_key='mime-types'), 'jpeg', 'JPEG image (.jpg, .jpeg)', 'Common media type for JPEG images.', '{"extension":".jpg,.jpeg","mime":"image/jpeg","category":"image"}', (SELECT id FROM source_registry WHERE source_key='iana-media-types'), 'https://www.iana.org/assignments/media-types/media-types.xhtml', 'Draft: verify media type and extension mapping.', 'draft'),
  ((SELECT id FROM data_collections WHERE collection_key='mime-types'), 'webp', 'WebP image (.webp)', 'Common media type for WebP images.', '{"extension":".webp","mime":"image/webp","category":"image"}', (SELECT id FROM source_registry WHERE source_key='iana-media-types'), 'https://www.iana.org/assignments/media-types/media-types.xhtml', 'Draft: verify media type and extension mapping.', 'draft'),
  ((SELECT id FROM data_collections WHERE collection_key='mime-types'), 'svg', 'SVG image (.svg)', 'Common media type for SVG vector images.', '{"extension":".svg","mime":"image/svg+xml","category":"image"}', (SELECT id FROM source_registry WHERE source_key='iana-media-types'), 'https://www.iana.org/assignments/media-types/media-types.xhtml', 'Draft: verify media type and extension mapping.', 'draft'),
  ((SELECT id FROM data_collections WHERE collection_key='mime-types'), 'mp3', 'MP3 audio (.mp3)', 'Common media type for MPEG audio.', '{"extension":".mp3","mime":"audio/mpeg","category":"audio"}', (SELECT id FROM source_registry WHERE source_key='iana-media-types'), 'https://www.iana.org/assignments/media-types/media-types.xhtml', 'Draft: verify media type and extension mapping.', 'draft'),
  ((SELECT id FROM data_collections WHERE collection_key='mime-types'), 'mp4', 'MP4 video (.mp4)', 'Common media type for MP4 video.', '{"extension":".mp4","mime":"video/mp4","category":"video"}', (SELECT id FROM source_registry WHERE source_key='iana-media-types'), 'https://www.iana.org/assignments/media-types/media-types.xhtml', 'Draft: verify media type and extension mapping.', 'draft');
