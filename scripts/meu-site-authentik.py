"""Executed by setup-meu-site.py inside the installed Authentik Django shell."""
import json

from django.db import transaction
from authentik.core.models import Application, Group, User, PropertyMapping
from authentik.flows.models import Flow
from authentik.outposts.models import Outpost
from authentik.policies.engine import PolicyEngine
from authentik.policies.expression.models import ExpressionPolicy
from authentik.policies.models import PolicyBinding
from authentik.providers.proxy.models import ProxyProvider

ORIGIN = "https://meusite.nilvanlopes.com"

with transaction.atomic():
    user = User.objects.get(username="pyu", is_active=True)
    group, _ = Group.objects.get_or_create(name="meu-site")
    group.users.set([user])
    policy, _ = ExpressionPolicy.objects.update_or_create(
        name="meu-site-only-pyu",
        defaults={"expression": (
            'return request.user.is_active and request.user.username == "pyu" '
            'and ak_is_group_member(request.user, name="meu-site")'
        )},
    )
    provider, _ = ProxyProvider.objects.update_or_create(
        name="meu-site-forward-auth",
        defaults={
            "authentication_flow": Flow.objects.get(slug="default-authentication-flow"),
            "authorization_flow": Flow.objects.get(slug="default-provider-authorization-implicit-consent"),
            "invalidation_flow": Flow.objects.get(slug="default-provider-invalidation-flow"),
            "mode": "forward_single",
            "external_host": ORIGIN,
            "internal_host": "http://meu-site_web:8080",
            "cookie_domain": "",
            "skip_path_regex": "",
            "intercept_header_auth": False,
            "basic_auth_enabled": False,
            "grant_types": ["authorization_code"],
            "_redirect_uris": [{
                "url": ORIGIN + "/outpost.goauthentik.io/callback?X-authentik-auth-callback=true",
                "matching_mode": "strict",
                "redirect_uri_type": "authorization",
            }],
        },
    )
    provider.property_mappings.set(PropertyMapping.objects.filter(managed__in=[
        "goauthentik.io/providers/proxy/scope-proxy",
        "goauthentik.io/providers/oauth2/scope-openid",
        "goauthentik.io/providers/oauth2/scope-email",
        "goauthentik.io/providers/oauth2/scope-profile",
    ]))
    app, _ = Application.objects.update_or_create(
        slug="meu-site",
        defaults={"name": "Meu site", "provider": provider,
                  "meta_launch_url": ORIGIN, "policy_engine_mode": "all"},
    )
    # Reconcile only this app; never inherit policies/groups from other apps.
    group_binding, _ = PolicyBinding.objects.update_or_create(
        target=app, group=group,
        defaults={"order": 0, "enabled": True, "negate": False, "policy": None, "user": None},
    )
    policy_binding, _ = PolicyBinding.objects.update_or_create(
        target=app, policy=policy,
        defaults={"order": 10, "enabled": True, "negate": False, "group": None, "user": None},
    )
    PolicyBinding.objects.filter(target=app).exclude(pk__in=[group_binding.pk, policy_binding.pk]).delete()
    outpost, _ = Outpost.objects.get_or_create(name="meu-site-outpost", defaults={"type": "proxy"})
    outpost.type = "proxy"
    outpost.service_connection = None
    config = outpost.config
    config.authentik_host = "http://server:9000"
    config.authentik_host_browser = "https://authentik.nilvanlopes.com"
    outpost.config = config
    outpost.save()
    outpost.providers.set([provider])
    token = outpost.token.key
    outpost.build_user_permissions(outpost.user)

    decisions = {}
    candidates = [user, User.objects.filter(is_active=True, type="internal").exclude(
        username__in=["pyu", "AnonymousUser"]).first()]
    assert candidates[1] is not None, "No existing active user available for negative policy check"
    for candidate in candidates:
        engine = PolicyEngine(app, candidate)
        engine.use_cache = False
        engine.build()
        decisions[candidate.username] = engine.result.passing
    assert decisions["pyu"] is True, "Policy must allow pyu"
    assert decisions[candidates[1].username] is False, "Policy must deny unrelated users"
    assert list(group.users.values_list("username", flat=True)) == ["pyu"]

# Consumed in memory by setup-meu-site.py; never print this shell output to a terminal.
print("MEU_SITE_RESULT=" + json.dumps({"token": token, "decisions": decisions}))
