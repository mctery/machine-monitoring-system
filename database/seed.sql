-- Seed data for machine_hours table
-- 60 machines from screenshot
-- run_hour = weekly_actual_ratio / 100 (approximation)

-- Create table
CREATE TABLE IF NOT EXISTS machine_hours (
    id INT AUTO_INCREMENT PRIMARY KEY,
    log_time DATETIME NOT NULL,
    machine_name VARCHAR(50) NOT NULL,
    run_hour FLOAT NOT NULL,
    stop_hour FLOAT NOT NULL,
    run_status TINYINT NOT NULL,
    stop_status TINYINT NOT NULL,
    rework_status INT NULL
);

-- Insert 60 machines (state RUN = run_status:1, STOP = stop_status:1)
INSERT INTO machine_hours (log_time, machine_name, run_hour, stop_hour, run_status, stop_status, rework_status) VALUES
-- PIS Group
('2025-12-09 23:00:00', 'Model 1', 0, 1614.52, 0, 1, NULL),
('2025-12-09 23:00:00', 'Model 2', 0, 1614.53, 0, 1, NULL),
('2025-12-09 23:00:00', 'Model 3', 0.65, 895.52, 1, 0, NULL),
('2025-12-09 23:00:00', 'Model 4', 0.34, 1255.65, 1, 0, NULL),
('2025-12-09 23:00:00', 'PIS Casting', 0.46, 993.27, 1, 0, NULL),
('2025-12-09 23:00:00', 'Side piece 1', 0.83, 922.02, 1, 0, NULL),
('2025-12-09 23:00:00', 'Side piece 2', 0, 961.88, 0, 1, NULL),
('2025-12-09 23:00:00', 'Side piece 3', 0.72, 807.27, 1, 0, NULL),
('2025-12-09 23:00:00', 'Side piece 4', 0, 1602.65, 0, 1, NULL),
('2025-12-09 23:00:00', 'Side piece 5', 0, 845.17, 0, 1, NULL),
('2025-12-09 23:00:00', 'Side piece 6', 0, 1196, 0, 1, NULL),
('2025-12-09 23:00:00', 'Side piece 13', 0.92, 594.85, 1, 0, NULL),
('2025-12-09 23:00:00', 'Side piece 14', 0.85, 663.3, 1, 0, NULL),
('2025-12-09 23:00:00', 'Side piece 7', 0.73, 770.32, 1, 0, NULL),
('2025-12-09 23:00:00', 'Side piece 8', 0, 706.92, 0, 1, NULL),
('2025-12-09 23:00:00', 'Side piece 9', 0.76, 745.87, 1, 0, NULL),
('2025-12-09 23:00:00', 'Side piece 10', 0.29, 847.58, 1, 0, NULL),
('2025-12-09 23:00:00', 'Side piece 11', 0.85, 690.45, 1, 0, NULL),
('2025-12-09 23:00:00', 'Side piece 12', 0.82, 667.67, 1, 0, NULL),
('2025-12-09 23:00:00', 'NC Lathe 1', 0, 1437.48, 0, 1, NULL),
('2025-12-09 23:00:00', 'NC Lathe 2', 0, 1355.93, 0, 1, NULL),
('2025-12-09 23:00:00', 'NC Lathe 3', 0, 1399.37, 0, 1, NULL),
('2025-12-09 23:00:00', 'NC Lathe 4', 0, 1497.95, 0, 1, NULL),
('2025-12-09 23:00:00', 'NC Lathe 5', 0, 1448.83, 0, 1, NULL),
('2025-12-09 23:00:00', 'Model 5', 0.60, 1025.88, 1, 0, NULL),
('2025-12-09 23:00:00', 'Model 6', 0.49, 1097, 1, 0, NULL),
-- 3G Group
('2025-12-09 23:00:00', '3G Laser 1', 0.28, 1407.73, 1, 0, NULL),
('2025-12-09 23:00:00', '3G Laser 2', 0, 1174.5, 0, 1, NULL),
('2025-12-09 23:00:00', '3G Laser 3', 0.34, 1226.55, 1, 0, NULL),
-- SECTOR Group
('2025-12-09 23:00:00', 'Turning 8', 0, 981.4, 0, 1, NULL),
('2025-12-09 23:00:00', 'Machining 9', 0, 1117.43, 0, 1, NULL),
('2025-12-09 23:00:00', 'Machining 1', 0, 1603.13, 0, 1, NULL),
('2025-12-09 23:00:00', 'Machining 8', 0, 1547.18, 0, 1, NULL),
('2025-12-09 23:00:00', 'Turning 4', 0, 1468.68, 0, 1, NULL),
('2025-12-09 23:00:00', 'Turning 9', 0, 1342.6, 0, 1, NULL),
('2025-12-09 23:00:00', 'Machining 7', 0, 1614.53, 0, 1, NULL),
('2025-12-09 23:00:00', 'Machining 3', 0, 1198.33, 0, 1, NULL),
('2025-12-09 23:00:00', 'Machining 4', 0, 1284.83, 0, 1, NULL),
('2025-12-09 23:00:00', 'Machining 10', 0.40, 957.63, 1, 0, NULL),
('2025-12-09 23:00:00', 'Turning 1', 0, 1484.17, 0, 1, NULL),
('2025-12-09 23:00:00', 'Turning 2', 0.54, 865.33, 1, 0, NULL),
('2025-12-09 23:00:00', 'Turning 3', 0.49, 877, 1, 0, NULL),
-- SIDE MOLD Group
('2025-12-09 23:00:00', 'Machining 2', 0, 1411.82, 0, 1, NULL),
('2025-12-09 23:00:00', 'Machining 5', 0, 1155.48, 0, 1, NULL),
('2025-12-09 23:00:00', 'Machining 6', 0.04, 1171.27, 1, 0, NULL),
('2025-12-09 23:00:00', 'Turning 5', 0.46, 955.8, 1, 0, NULL),
('2025-12-09 23:00:00', 'Turning 7', 0.14, 1351.02, 1, 0, NULL),
('2025-12-09 23:00:00', 'Letter 1', 0, 354.57, 0, 1, NULL),
('2025-12-09 23:00:00', 'Letter 2', 0.91, 427.92, 1, 0, NULL),
('2025-12-09 23:00:00', 'Letter 3', 0.96, 828.3, 1, 0, NULL),
('2025-12-09 23:00:00', 'Letter 4', 0.45, 465.55, 1, 0, NULL),
('2025-12-09 23:00:00', 'Letter 5', 0.81, 483.12, 1, 0, NULL),
('2025-12-09 23:00:00', 'Letter 6', 0.97, 469.52, 1, 0, NULL),
('2025-12-09 23:00:00', 'Letter 7', 0.91, 467.8, 1, 0, NULL),
('2025-12-09 23:00:00', 'Letter 8', 0, 522.62, 0, 1, NULL),
('2025-12-09 23:00:00', 'Letter 9', 0, 1603.02, 0, 1, NULL),
('2025-12-09 23:00:00', 'Letter 10', 0, 395.83, 0, 1, NULL),
('2025-12-09 23:00:00', 'Letter 11', 0.81, 409.78, 1, 0, NULL),
-- BLADE Group
('2025-12-09 23:00:00', 'Laser 1', 1.00, 1141.9, 1, 0, NULL),
('2025-12-09 23:00:00', 'Laser 2', 0, 1605.78, 0, 1, NULL);
