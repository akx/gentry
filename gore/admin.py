from django.contrib import admin

from gore.models import Key, Project


class KeyInline(admin.TabularInline):
    model = Key
    extra = 0


class ProjectAdmin(admin.ModelAdmin):
    inlines = [KeyInline]
    prepopulated_fields = {'slug': ('name',)}


admin.site.register(Project, ProjectAdmin)
