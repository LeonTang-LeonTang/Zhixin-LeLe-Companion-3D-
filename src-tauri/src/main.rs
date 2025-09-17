// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::create_chat_window,
            commands::search_knowledge,
            commands::call_mcp_tool,
            commands::generate_llm_response,
            commands::set_tencent_cloud_config,
            commands::get_service_status,
            commands::add_knowledge_document
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
