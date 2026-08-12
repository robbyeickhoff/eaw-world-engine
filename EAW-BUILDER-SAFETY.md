# EAW Builder Safety Contract

EAW Builder starts in safe mode. Surveying is read-only and construction is locked.

Every future terrain or structure build requires:

1. A closed-world checkpoint created before the build session.
2. A read-only survey of the complete approved area.
3. A build ticket with an objective, hard 3D boundary, maximum block-change count, and reviewable stages.
4. A preflight report before any block change.
5. An explicitly armed stage.
6. One Editor undo transaction per stage.
7. Review before the next stage is armed.

Direct block-writing functions are prohibited. Builds extending outside their ticket boundary or exceeding their block-change limit are refused automatically.

World restore operations remain manual and require Robby's explicit authorization.
