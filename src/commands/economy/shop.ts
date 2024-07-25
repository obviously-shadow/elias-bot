import { ChatInputCommandInteraction, AutocompleteInteraction, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandStringOption, SlashCommandSubcommandBuilder } from 'discord.js';
import { Command } from '../../structure/Command';
import shop from '../../json/shop.json';
import { Embed, EmbedColor } from '../../structure/Embed';
import emojis from '../../json/emojis.json';
import { UserModel } from '../../schemas/User';
import fs from 'fs';
import path from 'path';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shop')
		.setDescription('Commands related to the shop.')
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName('view')
				.setDescription('View the items in the shop.')
		)
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName('buy')
				.setDescription('Buys an item from the shop.')
				.addStringOption(
					new SlashCommandStringOption()
						.setName('item')
						.setDescription('The item you want to buy.')
						.addChoices(
							{ name: 'Lock', value: 'Lock' },
							{ name: 'Lockpick', value: 'Lockpick' },
							{ name: 'Security Camera', value: 'Security Camera' },
							{ name: 'Shovel', value: 'Shovel' }
						)
						.setRequired(true)
				)
				.addIntegerOption(
					new SlashCommandIntegerOption()
						.setName('amount')
						.setDescription('The number of items you want to buy.')
						.setMinValue(1)
				)
		)
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName('sell')
				.setDescription('Sell an item in your inventory.')
				.addStringOption(
					new SlashCommandStringOption()
						.setName('item')
						.setDescription('The item you want to sell.')
						.setAutocomplete(true)
						.setRequired(true)
				)
				.addIntegerOption(
					new SlashCommandIntegerOption()
						.setName('amount')
						.setDescription('The number of items you want to sell (defaults to 1).')
						.setMinValue(1)
				)
		),

	async onCommandInteraction(interaction: ChatInputCommandInteraction) {
		switch (interaction.options.getSubcommand()) {
			case 'view':
				let description = '';
				shop.forEach(item =>
					description += `**${emojis[item.name]} ${item.name}** - ${item.price.toLocaleString()} ${emojis.coin}\n`
				);

				interaction.reply({
					embeds: [
						new Embed({
							color: EmbedColor.primary,
							title: 'Shop',
							description: description
						})
					]
				});
				return;

			case 'buy':
				const itemName = interaction.options.getString('item');
				const amount = interaction.options.getInteger('amount', false) ?? 1;
				const item = shop.filter(item => item.name == itemName)[0];
				const user = await UserModel.findById(interaction.user.id);

				if (!user || item.price * amount > user.balance) {
					interaction.reply({
						embeds: [
							new Embed({
								color: EmbedColor.danger,
								description: 'You do not have enough money!'
							})
						],
						ephemeral: true
					});
					return;
				}

				interaction.reply({
					embeds: [
						new Embed({
							color: EmbedColor.primary,
							title: 'Buy',
							description: `You bought **${amount}x ${emojis[itemName]} ${itemName}**!`
						})
					]
				});

				user.inventory.set(
					itemName,
					(user.inventory.get(itemName) ?? 0) + amount
				);
				user.balance -= item.price * amount;
				user.save();
				return;

			case 'sell':
				const item = interaction.options.getString('item');
				const amount = interaction.options.getInteger('amount', false) ?? 1;
				const user = await UserModel.findById(interaction.user.id);

				if (!user || (user.inventory.get(item) ?? 0) < amount) {
					interaction.reply({
						embeds: [
							new Embed({
								color: EmbedColor.danger,
								description: 'You do not have enough items to sell!'
							})
						],
						ephemeral: true
					});
					return;
				}

				const sellPrice = Math.floor(
					shop.find(item => item.name == item).price * 0.75 * amount
				);

				interaction.reply({
					embeds: [
						new Embed({
							color: EmbedColor.primary,
							title: 'Sell',
							description: `You sold **${amount}x ${emojis[item]} ${item}** for ${sellPrice.toLocaleString()} ${emojis.coin}!`
						})
					]
				});

				user.inventory.set(item, (user.inventory.get(item) ?? 0) - amount);
				user.balance += sellPrice;
				user.save();
				return;
		}
	},

	async onAutocompleteInteraction(interaction: AutocompleteInteraction) {
<<<<<<< HEAD
		const focusedOption = interaction.options.getFocused(true);
		const user = await UserModel.findById(interaction.user.id);
	
		if (!user) {
			interaction.respond([]);
			return;
		}
	
		const results = Array.from(user.inventory.entries())
			.filter(([item, quantity]) => quantity > 0)
			.map(([item]) => item)
			.filter(item => item.toLowerCase().includes(focusedOption.value.toLowerCase()))
			.map(item => ({ name: item, value: item }));
	
		interaction.respond(results);
=======
    const user = await UserModel.findById(interaction.user.id);
    const option = interaction.options.getFocused(true);
        
    if (!user) {
        interaction.respond([]);
        return;
    }

    const results = Array.from(user.inventory.entries())
        .filter(([item, quantity]) => quantity > 0)
        .map(([item]) => item)
        .filter(item => item.toLowerCase().includes(option.value.toLowerCase()))
        .map(item => ({ name: item, value: item }));

    interaction.respond(results);
>>>>>>> 4f93b22a79f8cbb4129f3469556185ac544aa55d
	}
} satisfies Command;
