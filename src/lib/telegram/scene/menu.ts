// tslint:disable: no-submodule-imports
import { aboutExtra, countdownExtra, counterExtra, guideExtra, handleMediaExtra, handleUserExtra, menuExtra, startExtra } from 'extra';
import removeMD from 'remove-markdown';
import { IBotContext, LanguageRequest, ListFilterRequest, ListRequest, LocationRequest, MenuRequest, NotifyRequests, TimeRequest,
UserRequest } from 'telegraf-bot-typings';
import Scene from 'telegraf/scenes/base';
import { IUserTTFInfo } from '.';
import { handleCounter, handleMedia, handleUser } from '../parse/menu';

export const menuScene = new Scene('Menu');

menuScene.leave(async ({ i18n, replyWithMarkdown }: IBotContext) => replyWithMarkdown(i18n.t('leavingMenu')));

menuScene.enter(async ({ i18n, replyWithMarkdown }: IBotContext) => {
    await replyWithMarkdown(i18n.t('menuGreetings'), startExtra(i18n));

    return replyWithMarkdown(i18n.t('menuOptions'), menuExtra(i18n));
});

menuScene.on('text', async ({ i18n, scene, message }: IBotContext) => {
    let text = '';

    if (undefined !== message.reply_to_message) {
        text = message.reply_to_message.text;
    } if (removeMD(i18n.t('askLocationOptions')) === text) {
        return scene.enter('Location');
    }

    return scene.leave();
});

menuScene.on('callback_query', async ({ i18n, from, scene, answerCbQuery, callbackQuery, editMessageText }: IBotContext) => {
    const { id } = from;
    const translation = i18n;
    const data = callbackQuery.data.split('/');
    const kind = <MenuRequest> data[0];

    await answerCbQuery(i18n.t('loading'));

    if ('ABOUT' === kind) {
        return editMessageText(i18n.t('aboutOptions'), aboutExtra());
    } if ('MENU' === kind) {
        return editMessageText(i18n.t('menuOptions'), menuExtra(translation));
    } if ('GUIDE' === kind) {
        return editMessageText(i18n.t('guideOptions'), guideExtra(translation));
    } if ('COUNTDOWN' === kind) {
        return editMessageText(i18n.t('countdownOptions', { anime: '' }), countdownExtra());
    } if ('COUNTER' === kind) {
        return editMessageText(await handleCounter({ id, translation }), counterExtra());
    } if ('USER' === kind) {
        const request = (2 <= data.length) ? <UserRequest | TimeRequest> data[1] : null;
        const value = (3 === data.length) ? <LanguageRequest | NotifyRequests | LocationRequest | number> data[2] : null;

        return editMessageText(await handleUser({
            id,
            value,
            request,
            translation
        }), handleUserExtra({ value, request, translation }));
    } if ('MEDIA' === kind) {
        const list = <ListRequest> data[1];
        const filter = <ListFilterRequest> data[2];

        return editMessageText(await handleMedia({
            id,
            list,
            filter,
            translation,
            user: <IUserTTFInfo> scene.state
        }), handleMediaExtra({ list, filter, translation }));
    }

    return scene.leave();
});