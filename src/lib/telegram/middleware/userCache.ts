import { IBotContext, KindRequest, LanguageRequest } from 'telegraf-bot-typings';
import { IHandleNext } from '.';
import { getLanguageCode } from '../handle/language';

/**
 * Just a setting user language if available.
 * TSLint disable is used here because of Telegraf's TS typings.
 */
export class UserCache {
    // tslint:disable-next-line: no-any
    public middleware(): any {
        // tslint:disable-next-line: no-any
        return async ({ redis, i18n, updateType, callbackQuery }: IBotContext, next: () => any) => {
            if (null !== redis.language || undefined !== redis.language) {
                i18n.locale(redis.language);
            }

            return next().then(() => this.handleNext({ redis, updateType, callbackQuery }));
        };
    }

    private handleNext({ redis, updateType, callbackQuery }: IHandleNext): boolean {
        if ('callback_query' === updateType) {
            const data = callbackQuery.data.split('/');
            const request = (<KindRequest> data[1]).split('-');

            if ('LANGUAGE' === request[0] && request.length > 1) {
                redis.language = getLanguageCode(<LanguageRequest> data[1]);
            }

            return true;
        }

        return false;
    }
}
