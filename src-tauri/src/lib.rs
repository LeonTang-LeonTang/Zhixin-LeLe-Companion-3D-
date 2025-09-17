
// 创建聊天窗口
#[tauri::command]
async fn create_chat_window(app: tauri::AppHandle) -> Result<(), String> {
    // 在Tauri 2.x中，我们使用WebviewWindow来创建新窗口
    let _chat_window = tauri::WebviewWindowBuilder::new(
        &app,
        "chat",
        tauri::WebviewUrl::App("chat.html".into())
    )
    .title("与小竹子聊天")
    .inner_size(400.0, 500.0)
    .resizable(true)
    .decorations(true)
    .always_on_top(false)
    .center()
    .build()
    .map_err(|e| e.to_string())?;

    Ok(())
}

// 移动窗口到指定位置
#[tauri::command]
async fn move_window(window: tauri::Window, x: i32, y: i32) -> Result<(), String> {
    window.set_position(tauri::Position::Physical(tauri::PhysicalPosition { x, y }))
        .map_err(|e| e.to_string())?;
    Ok(())
}

// 获取屏幕尺寸
#[tauri::command]
async fn get_screen_size() -> Result<(u32, u32), String> {
    // 这里可以使用系统API获取屏幕尺寸
    // 暂时返回默认值
    Ok((1920, 1080))
}

// 设置窗口置顶
#[tauri::command]
async fn set_always_on_top(window: tauri::Window, always_on_top: bool) -> Result<(), String> {
    window.set_always_on_top(always_on_top)
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            create_chat_window,
            move_window,
            get_screen_size,
            set_always_on_top
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
