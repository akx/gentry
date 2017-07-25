from django.contrib import admin
from django.contrib.admin.sites import AlreadyRegistered
from polymorphic.admin import PolymorphicChildModelFilter, PolymorphicParentModelAdmin
from polymorphic.admin.childadmin import PolymorphicChildModelAdmin

from .models import Notifier

for cls in Notifier.__subclasses__():
    admin_cls = type('%sAdmin' % cls.__name__, (PolymorphicChildModelAdmin,), {'base_model': Notifier})
    try:
        admin.site.register(cls, admin_cls)
    except AlreadyRegistered:  # pragma: no cover
        pass


@admin.register(Notifier)
class NotifierParentAdmin(PolymorphicParentModelAdmin):
    base_model = Notifier
    child_models = Notifier.__subclasses__()
    list_filter = (PolymorphicChildModelFilter, 'enabled')
    list_display = ('__str__', 'enabled')
