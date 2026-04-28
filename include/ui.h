#ifndef UI_H
#define UI_H

void ui_init(void);
void ui_clear_screen(void);
void ui_print_header(const char *title);
void ui_set_color_green(void);
void ui_set_color_red(void);
void ui_set_color_reset(void);
unsigned int ui_show_main_menu(void);

#endif // UI_H
