# Generated by Django 4.2.16 on 2024-11-11 16:35

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('gore', '0006_envelope'),
    ]

    operations = [
        migrations.AddField(
            model_name='event',
            name='envelope',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to='gore.envelope',
            ),
        ),
    ]
