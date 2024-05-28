const semver = require("semver");

function decrementVersion(version, component) {
    if (component < 0) {
        throw new Error("Version component cannot be negative.");
    }
    return Math.max(0, component - 1);
}

function getPreviousVersion(currentVersion, releaseType) {
    if (!semver.valid(currentVersion)) {
        throw new Error(`Invalid version: ${currentVersion}`);
    }

    const parsedVersion = semver.parse(currentVersion);
    let previousVersion = currentVersion;

    switch (releaseType) {
        case "major":
            previousVersion = `v${decrementVersion(parsedVersion.major, 1)}.0.0`;
            break;
        case "minor":
            if (parsedVersion.minor === 0 && parsedVersion.major > 0) {
                previousVersion = `v${decrementVersion(parsedVersion.major, 1)}.0.0`;
            } else {
                previousVersion = `v${parsedVersion.major}.${decrementVersion(parsedVersion.minor, 1)}.0`;
            }
            break;
        case "patch":
            if (parsedVersion.patch === 0) {
                previousVersion = getPreviousVersion(`${parsedVersion.major}.${parsedVersion.minor}.0`, 'minor');
            } else {
                previousVersion = `v${parsedVersion.major}.${parsedVersion.minor}.${decrementVersion(parsedVersion.patch, 1)}`;
            }
            break;
        case "alpha":
        case "beta":
        case "rc":
            if (parsedVersion.prerelease.length && parsedVersion.prerelease[1] > 0) {
                previousVersion = `v${parsedVersion.major}.${parsedVersion.minor}.${parsedVersion.patch}-${releaseType}.${parsedVersion.prerelease[1] - 1}`;
            } else {
                previousVersion = `v${parsedVersion.major}.${parsedVersion.minor}.${parsedVersion.patch}`;
            }
            break;
        default:
            throw new Error(`Unsupported release type: ${releaseType}`);
    }

    return previousVersion;
}

const [currentVersion, releaseType] = process.argv.slice(-2);
try {
    console.log(getPreviousVersion(currentVersion, releaseType));
} catch (error) {
    console.error(`Error: ${error.message}`);
}
