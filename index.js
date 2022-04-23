const micromatch = require('micromatch');
const {verifyConditions, addChannel: addChannelGitHub, publish: publishGitHub, success: successGitHub, fail} = require('@semantic-release/github');

async function addChannel(pluginConfig, context) {
  const {logger} = context;

  if (!canDo(context)) {
    logger.log('Skip rest add channel step on fixed version mode.');
    return;
  }

  if (!isIncludes(pluginConfig, context)) {
    return;
  }

  return addChannelGitHub(pluginConfig, context);
}

async function publish(pluginConfig, context) {
  const {logger, options, pkgContexts} = context;

  if (!canDo(context)) {
    logger.log('Skip rest publish step on fixed version mode.');
    return;
  }

  if (!isIncludes(pluginConfig, context)) {
    return;
  }

  if (options.versionMode === 'fixed') {
    context.nextRelease.notes = Object.values(pkgContexts).reduce((notes, {name, nextRelease}) => {
      notes.push(`# ${name}\n\n${nextRelease.notes}`);
      return notes;
    }, []).join('\n\n');
  }

  return publishGitHub(pluginConfig, context);
}

async function success(pluginConfig, context) {
  const {logger} = context;

  if (!canDo(context)) {
    logger.log('Skip rest success step on fixed version mode.');
    return;
  }

  if (!isIncludes(pluginConfig, context)) {
    return;
  }

  return addChannelGitHub(pluginConfig, context);
}

function canDo({options: {versionMode}, name, pkgs}) {
  if (versionMode !== 'fixed') {
    return true;
  }

  return name === Object.keys(pkgs)[0];
}

function isIncludes(pluginConfig, context) {
  if (pluginConfig.includes && !micromatch.isMatch(context.name, pluginConfig.includes)) {
    context.logger.log('Package name ' + context.name + ' does not match pattern: ' + pluginConfig.includes);
    return false;
  }
  return true;
}

module.exports = {verifyConditions, addChannel, publish, success, fail};