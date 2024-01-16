import { ActionRowBuilder, ButtonInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../structure/Command';
import { User } from '../../schemas/User';
import { Embed, EmbedColor } from '../../structure/Embed';
import emojis from '../../json/emojis.json';
import { Button } from '../../structure/Button';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('work')
		.setDescription('Work for some extra coins.'),

	async onCommandInteraction(interaction: ChatInputCommandInteraction) {
		const dbUser = await User.findById(interaction.user.id) ??
			await User.create({ _id: interaction.user.id });
		const now = Math.floor(Date.now() / 1000);

		if (dbUser.cooldowns.get('work') > now) {
			interaction.reply({
				embeds: [
					new Embed({
						color: EmbedColor.danger,
						description: `You are on cooldown! Come back <t:${dbUser.cooldowns.get('work')}:R>`,
					}),
				],
				ephemeral: true,
			});
			return;
		}

		const colors = ['red', 'orange', 'yellow', 'green', 'blue'];
		const shapes = ['square', 'heart', 'circle'];

		const emojis = [];

		for (const shape of shapes) {
			const random = Math.round(Math.random() * (colors.length - 1));
			emojis.push(`${colors[random]}_${shape}`);
			colors.splice(random, 1);
		}

		let sequence = '';
		emojis.forEach(name => sequence += `:${name}: `);

		interaction.reply({
			embeds: [
				new Embed({
					color: EmbedColor.primary,
					title: 'Work',
					description: `Remember the colors of the following shapes.\n\n${sequence}`
				})
			]
		});

		const emoji = emojis[Math.round(Math.random() * (emojis.length - 1))];
		setTimeout(() => showButtons(interaction, emoji), 2500);

		dbUser.cooldowns.set('work', now + 1800);
		dbUser.save();
	},

	async onButtonInteraction(interaction: ButtonInteraction) {
		const user = interaction.message.interaction.user;

		if (interaction.user.id != user.id) {
			interaction.reply({
				embeds: [
					new Embed({
						color: EmbedColor.danger,
						description: 'You are not allowed to use this button!',
					}),
				],
				ephemeral: true,
			});
			return;
		}

		const dbUser = await User.findById(user.id);
		const segments = interaction.customId.split('|');

		if (segments[0] == segments[1]) {
			const money = Math.round(Math.random() * 2000 + 6000);

			interaction.message.edit({
				embeds: [
					new Embed({
						color: EmbedColor.success,
						title: 'Correct',
						description: `Good job! You earned ${money.toLocaleString()} ${emojis.coin} for your shift.`,
					}),
				],
				components: []
			});

			dbUser.balance += money;
		}
		else {
			const money = Math.round(Math.random() * 2000 + 4000);

			interaction.message.edit({
				embeds: [
					new Embed({
						color: EmbedColor.danger,
						title: 'Incorrect',
						description: `Terrible job. You earned ${money.toLocaleString()} ${emojis.coin} for your below average shift.`,
					}),
				],
				components: []
			});

			dbUser.balance += money;
		}
		
		dbUser.save();
	},
} satisfies Command;

function showButtons(interaction: ChatInputCommandInteraction, emoji: string) {
	const colors = ['red', 'orange', 'yellow', 'green', 'blue'];
	const shape = emoji.split('_')[1];

	const actionRow = new ActionRowBuilder<Button>();

	colors.forEach(color => {
		actionRow.addComponents(
			Button.secondary({
				custom_id: `${color}|${emoji.split('_')[0]}`,
				emoji: emojis[`${color}_${shape}`]
			})
		);
	});

	interaction.editReply({
		embeds: [
			new Embed({
				color: EmbedColor.primary,
				title: 'Work',
				description: `What color was the ${shape}?`
			})
		],
		components: [actionRow]
	});
}