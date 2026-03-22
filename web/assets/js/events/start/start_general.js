
$(function ()
{
    // Verify Session
    let verify_session = () =>
    {
        // Wait animation
        let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

        // Request
        new wtools.Request(server_config.current.api + "/auth/login", "POST").Exec_((response_data) =>
        {
            if(response_data.status != 200)
            {
                new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
                window.location.href = "/login/";
                return;
            }

            wait.Off_();
        });
    };
    verify_session();

    // Elements
    new Sidebars().SidebarMenu_();
    new Headers().Header_();
    new Footers().Footer_();
    new wtools.MenuManager('#menu_main', true);

    hide_elements_without_permission();
});