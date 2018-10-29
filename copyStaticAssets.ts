import * as shell from 'shelljs';

if (!shell.test('-e', 'dist/config')) {
    shell.mkdir('dist/config');
}
// shell.cp('-u', 'src/config/Aperture-Test-Manager-V2-8e1d10e8342c.json', 'dist/config/Aperture-Test-Manager-V2-8e1d10e8342c.json');
