# Generated by Django 2.0.6 on 2018-06-26 07:18

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('gotify', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='emailnotifier',
            options={'base_manager_name': 'objects'},
        ),
        migrations.AlterModelOptions(
            name='notifier',
            options={'base_manager_name': 'objects'},
        ),
    ]