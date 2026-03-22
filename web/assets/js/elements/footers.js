
class Footers
{
    constructor()
    {
        
    }
    Footer_()
    {
        let year = new Date().getFullYear();
        $(".main_footer").append
        (`
            <div class="py-3 my-4">
                <div class="d-flex align-items-center justify-content-between small">
                    <div class="text-muted">Copyright &copy; ${year} StructBX.</div>
                    <div>
                        <a target="_blank" href="https://structbx.com">structbx.com</a>
                        &middot;
                        <a target="_blank" href="https://structbx.com/assets/files/terms_and_conditions.pdf">Pol&iacute;tica de privacidad</a>
                        &middot;
                        <a target="_blank" href="https://structbx.com/assets/files/privacy_policy.pdf">T&eacute;rminos y condiciones</a>
                        &middot;
                        <a target="_blank" href="https://www.apache.org/licenses/LICENSE-2.0">Licencia Apache 2.0</a>
                    </div>
                </div>
            </div>
        `);
    }
}